class JetBase {
    constructor(webix) {
        this.webixJet = true;
        this.webix = webix;
        this._events = [];
        this._subs = {};
        this._data = {};
    }
    getRoot() {
        return this._root;
    }
    destructor() {
        this._detachEvents();
        this._destroySubs();
        this._events = this._container = this.app = this._parent = this._root = null;
    }
    setParam(id, value, url) {
        if (this._data[id] !== value) {
            this._data[id] = value;
            this._segment.update(id, value, 0);
            if (url) {
                this.show(null);
            }
        }
    }
    getParam(id, parent) {
        const value = this._data[id];
        if (typeof value !== "undefined" || !parent) {
            return value;
        }
        const view = this.getParentView();
        if (view) {
            return view.getParam(id, parent);
        }
    }
    getUrl() {
        return this._segment.suburl();
    }
    getUrlString() {
        return this._segment.toString();
    }
    getParentView() {
        return this._parent;
    }
    $$(id) {
        if (typeof id === "string") {
            const root = this.getRoot();
            return root.queryView((obj => (obj.config.id === id || obj.config.localId === id) &&
                (obj.$scope === root.$scope)), "self");
        }
        else {
            return id;
        }
    }
    on(obj, name, code) {
        const id = obj.attachEvent(name, code);
        this._events.push({ obj, id });
        return id;
    }
    contains(view) {
        for (const key in this._subs) {
            const kid = this._subs[key].view;
            if (kid === view || kid.contains(view)) {
                return true;
            }
        }
        return false;
    }
    getSubView(name) {
        const sub = this.getSubViewInfo(name);
        if (sub) {
            return sub.subview.view;
        }
    }
    getSubViewInfo(name) {
        const sub = this._subs[name || "default"];
        if (sub) {
            return { subview: sub, parent: this };
        }
        if (name === "_top") {
            this._subs[name] = { url: "", id: null, popup: true };
            return this.getSubViewInfo(name);
        }
        // when called from a child view, searches for nearest parent with subview
        if (this._parent) {
            return this._parent.getSubViewInfo(name);
        }
        return null;
    }
    _detachEvents() {
        const events = this._events;
        for (let i = events.length - 1; i >= 0; i--) {
            events[i].obj.detachEvent(events[i].id);
        }
    }
    _destroySubs() {
        // destroy sub views
        for (const key in this._subs) {
            const subView = this._subs[key].view;
            // it possible that subview was not loaded with any content yet
            // so check on null
            if (subView) {
                subView.destructor();
            }
        }
        // reset to prevent memory leaks
        this._subs = {};
    }
    _init_url_data() {
        const url = this._segment.current();
        this._data = {};
        this.webix.extend(this._data, url.params, true);
    }
    _getDefaultSub() {
        if (this._subs.default) {
            return this._subs.default;
        }
        for (const key in this._subs) {
            const sub = this._subs[key];
            if (!sub.branch && sub.view && key !== "_top") {
                const child = sub.view._getDefaultSub();
                if (child) {
                    return child;
                }
            }
        }
    }
    _routed_view() {
        const parent = this.getParentView();
        if (!parent) {
            return true;
        }
        const sub = parent._getDefaultSub();
        if (!sub && sub !== this) {
            return false;
        }
        return parent._routed_view();
    }
}

function parse(url) {
    // remove starting /
    if (url[0] === "/") {
        url = url.substr(1);
    }
    // split url by "/"
    const parts = url.split("/");
    const chunks = [];
    // for each page in url
    for (let i = 0; i < parts.length; i++) {
        const test = parts[i];
        const result = {};
        // detect params
        // support old 			some:a=b:c=d
        // and new notation		some?a=b&c=d
        let pos = test.indexOf(":");
        if (pos === -1) {
            pos = test.indexOf("?");
        }
        if (pos !== -1) {
            const params = test.substr(pos + 1).split(/[\:\?\&]/g);
            // create hash of named params
            for (const param of params) {
                const dchunk = param.split("=");
                result[dchunk[0]] = decodeURIComponent(dchunk[1]);
            }
        }
        // store parsed values
        chunks[i] = {
            page: (pos > -1 ? test.substr(0, pos) : test),
            params: result,
            isNew: true
        };
    }
    // return array of page objects
    return chunks;
}
function url2str(stack) {
    const url = [];
    for (const chunk of stack) {
        url.push("/" + chunk.page);
        const params = obj2str(chunk.params);
        if (params) {
            url.push("?" + params);
        }
    }
    return url.join("");
}
function obj2str(obj) {
    const str = [];
    for (const key in obj) {
        if (str.length) {
            str.push("&");
        }
        str.push(key + "=" + encodeURIComponent(obj[key]));
    }
    return str.join("");
}

class Route {
    constructor(route, index) {
        this._next = 1;
        if (typeof route === "string") {
            this.route = {
                url: parse(route),
                path: route
            };
        }
        else {
            this.route = route;
        }
        this.index = index;
    }
    current() {
        return this.route.url[this.index];
    }
    next() {
        return this.route.url[this.index + this._next];
    }
    suburl() {
        return this.route.url.slice(this.index);
    }
    shift() {
        return new Route(this.route, this.index + this._next);
    }
    refresh() {
        const url = this.route.url;
        for (let i = this.index + 1; i < url.length; i++) {
            url[i].isNew = true;
        }
    }
    toString() {
        const str = url2str(this.suburl());
        return str ? str.substr(1) : "";
    }
    _join(path, kids) {
        let url = this.route.url;
        if (path === null) { // change of parameters, route elements are not affected
            return url;
        }
        const old = this.route.url;
        url = old.slice(0, this.index + (kids ? this._next : 0));
        if (path) {
            url = url.concat(parse(path));
            for (let i = 0; i < url.length; i++) {
                if (old[i]) {
                    url[i].view = old[i].view;
                }
                if (old[i] && url[i].page === old[i].page) {
                    url[i].isNew = false;
                }
            }
        }
        return url;
    }
    append(path) {
        const url = this._join(path, true);
        this.route.path = url2str(url);
        this.route.url = url;
        return this.route.path;
    }
    show(path, view, kids) {
        const url = this._join(path, kids);
        return new Promise((res, rej) => {
            const redirect = url2str(url);
            const obj = {
                url,
                redirect,
                confirm: Promise.resolve()
            };
            const app = view ? view.app : null;
            // when creating a new route, it possible that it will not have any content
            // guard is not necessary in such case
            if (app) {
                const result = app.callEvent("app:guard", [obj.redirect, view, obj]);
                if (!result) {
                    rej();
                    return;
                }
            }
            obj.confirm.catch(() => obj.redirect = null).then(() => {
                if (obj.redirect === null) {
                    rej();
                    return;
                }
                if (obj.redirect !== redirect) {
                    app.show(obj.redirect);
                    rej();
                    return;
                }
                this.route.path = redirect;
                this.route.url = url;
                res();
            });
        });
    }
    size(n) {
        this._next = n;
    }
    split() {
        const route = {
            url: this.route.url.slice(this.index + 1),
            path: ""
        };
        if (route.url.length) {
            route.path = url2str(route.url);
        }
        return new Route(route, 0);
    }
    update(name, value, index) {
        const chunk = this.route.url[this.index + (index || 0)];
        if (!chunk) {
            this.route.url.push({ page: "", params: {} });
            return this.update(name, value, index);
        }
        if (name === "") {
            chunk.page = value;
        }
        else {
            chunk.params[name] = value;
        }
        this.route.path = url2str(this.route.url);
    }
}

class JetView extends JetBase {
    constructor(app, config) {
        super(app.webix);
        this.app = app;
        //this.$config = config;
        this._children = [];
    }
    ui(ui, config) {
        config = config || {};
        const container = config.container || ui.container;
        const jetview = this.app.createView(ui);
        this._children.push(jetview);
        jetview.render(container, this._segment, this);
        if (typeof ui !== "object" || (ui instanceof JetBase)) {
            // raw webix UI
            return jetview;
        }
        else {
            return jetview.getRoot();
        }
    }
    show(path, config) {
        config = config || {};
        // convert parameters object to url
        if (typeof path === "object") {
            for (const key in path) {
                this.setParam(key, path[key]);
            }
            path = null;
        }
        else {
            // deligate to app in case of root prefix
            if (path.substr(0, 1) === "/") {
                return this.app.show(path);
            }
            // local path, do nothing
            if (path.indexOf("./") === 0) {
                path = path.substr(2);
            }
            // parent path, call parent view
            if (path.indexOf("../") === 0) {
                const parent = this.getParentView();
                if (parent) {
                    return parent.show(path.substr(3), config);
                }
                else {
                    return this.app.show("/" + path.substr(3));
                }
            }
            const sub = this.getSubViewInfo(config.target);
            if (sub) {
                if (sub.parent !== this) {
                    return sub.parent.show(path, config);
                }
                else if (config.target && config.target !== "default") {
                    return this._renderFrameLock(config.target, sub.subview, path);
                }
            }
            else {
                if (path) {
                    return this.app.show("/" + path);
                }
            }
        }
        return this._show(this._segment, path, this);
    }
    _show(segment, path, view) {
        return segment.show(path, view, true).then(() => {
            this._init_url_data();
            return this._urlChange();
        }).then(() => {
            if (segment.route.linkRouter) {
                this.app.getRouter().set(segment.route.path, { silent: true });
                this.app.callEvent("app:route", [segment.route.path]);
            }
        });
    }
    init(_$view, _$) {
        // stub
    }
    ready(_$view, _$url) {
        // stub
    }
    config() {
        this.app.webix.message("View:Config is not implemented");
    }
    urlChange(_$view, _$url) {
        // stub
    }
    destroy() {
        // stub
    }
    destructor() {
        this.destroy();
        this._destroyKids();
        // destroy actual UI
        this._root.destructor();
        super.destructor();
    }
    use(plugin, config) {
        plugin(this.app, this, config);
    }
    refresh() {
        const url = this.getUrl();
        this.destroy();
        this._destroyKids();
        this._destroySubs();
        this._detachEvents();
        if (this._container.tagName) {
            this._root.destructor();
        }
        this._segment.refresh();
        return this._render(this._segment);
    }
    render(root, url, parent) {
        if (typeof url === "string") {
            url = new Route(url, 0);
        }
        this._segment = url;
        this._parent = parent;
        this._init_url_data();
        root = root || document.body;
        const _container = (typeof root === "string") ? this.webix.toNode(root) : root;
        if (this._container !== _container) {
            this._container = _container;
            return this._render(url);
        }
        else {
            return this._urlChange().then(() => this.getRoot());
        }
    }
    _render(url) {
        const config = this.config();
        if (config.then) {
            return config.then(cfg => this._render_final(cfg, url));
        }
        else {
            return this._render_final(config, url);
        }
    }
    _render_final(config, url) {
        // get previous view in the same slot
        let slot = null;
        let container = null;
        let show = false;
        if (!this._container.tagName) {
            slot = this._container;
            if (slot.popup) {
                container = document.body;
                show = true;
            }
            else {
                container = this.webix.$$(slot.id);
            }
        }
        else {
            container = this._container;
        }
        // view already destroyed
        if (!this.app || !container) {
            return Promise.reject(null);
        }
        let response;
        const current = this._segment.current();
        // using wrapper object, so ui can be changed from app:render event
        const result = { ui: {} };
        this.app.copyConfig(config, result.ui, this._subs);
        this.app.callEvent("app:render", [this, url, result]);
        result.ui.$scope = this;
        /* destroy old HTML attached views before creating new one */
        if (!slot && current.isNew && current.view) {
            current.view.destructor();
        }
        try {
            // special handling for adding inside of multiview - preserve old id
            if (slot && !show) {
                const oldui = container;
                const parent = oldui.getParentView();
                if (parent && parent.name === "multiview" && !result.ui.id) {
                    result.ui.id = oldui.config.id;
                }
            }
            this._root = this.app.webix.ui(result.ui, container);
            const asWin = this._root;
            // check for url added to ignore this.ui calls
            if (show && asWin.setPosition && !asWin.isVisible()) {
                asWin.show();
            }
            // check, if we are replacing some older view
            if (slot) {
                if (slot.view && slot.view !== this && slot.view !== this.app) {
                    slot.view.destructor();
                }
                slot.id = this._root.config.id;
                if (this.getParentView() || !this.app.app)
                    slot.view = this;
                else {
                    // when we have subapp, set whole app as a view
                    // so on destruction, the whole app will be destroyed
                    slot.view = this.app;
                }
            }
            if (current.isNew) {
                current.view = this;
                current.isNew = false;
            }
            response = Promise.resolve(this._init(this._root, url)).then(() => {
                return this._urlChange().then(() => {
                    this._initUrl = null;
                    return this.ready(this._root, url.suburl());
                });
            });
        }
        catch (e) {
            response = Promise.reject(e);
        }
        return response.catch(err => this._initError(this, err));
    }
    _init(view, url) {
        return this.init(view, url.suburl());
    }
    _urlChange() {
        this.app.callEvent("app:urlchange", [this, this._segment]);
        const waits = [];
        for (const key in this._subs) {
            const frame = this._subs[key];
            const wait = this._renderFrameLock(key, frame, null);
            if (wait) {
                waits.push(wait);
            }
        }
        return Promise.all(waits).then(() => {
            return this.urlChange(this._root, this._segment.suburl());
        });
    }
    _renderFrameLock(key, frame, path) {
        // if subview is not occupied by some rendering yet
        if (!frame.lock) {
            // retreive and store rendering end promise
            const lock = this._renderFrame(key, frame, path);
            if (lock) {
                // clear lock after frame rendering
                // as promise.finally is not supported by  Webix lesser than 6.2
                // using a more verbose notation
                frame.lock = lock.then(() => frame.lock = null, () => frame.lock = null);
            }
        }
        // return rendering end promise
        return frame.lock;
    }
    _renderFrame(key, frame, path) {
        //default route
        if (key === "default") {
            if (this._segment.next()) {
                // we have a next segment in url, render it
                return this._createSubView(frame, this._segment.shift());
            }
            else if (frame.view && frame.popup) {
                // there is no next segment, delete the existing sub-view
                frame.view.destructor();
                frame.view = null;
            }
        }
        //if new path provided, set it to the frame
        if (path !== null) {
            frame.url = path;
        }
        // in case of routed sub-view
        if (frame.route) {
            // we have a new path for sub-view
            if (path !== null) {
                return frame.route.show(path, frame.view).then(() => {
                    return this._createSubView(frame, frame.route);
                });
            }
            // do not trigger onChange for isolated sub-views
            if (frame.branch) {
                return;
            }
        }
        let view = frame.view;
        // if view doesn't exists yet, init it
        if (!view && frame.url) {
            if (typeof frame.url === "string") {
                // string, so we have isolated subview url
                frame.route = new Route(frame.url, 0);
                return this._createSubView(frame, frame.route);
            }
            else {
                // object, so we have an embeded subview
                if (typeof frame.url === "function" && !(view instanceof frame.url)) {
                    view = new frame.url(this.app, "");
                }
                if (!view) {
                    view = frame.url;
                }
            }
        }
        // trigger onChange for already existed view
        if (view) {
            return view.render(frame, (frame.route || this._segment), this);
        }
    }
    _initError(view, err) {
        /*
            if view is destroyed, ignore any view related errors
        */
        if (this.app) {
            this.app.error("app:error:initview", [err, view]);
        }
        return true;
    }
    _createSubView(sub, suburl) {
        return this.app.createFromURL(suburl.current(), sub.view).then(view => {
            return view.render(sub, suburl, this);
        });
    }
    _destroyKids() {
        // destroy child views
        const uis = this._children;
        for (let i = uis.length - 1; i >= 0; i--) {
            if (uis[i] && uis[i].destructor) {
                uis[i].destructor();
            }
        }
        // reset vars for better GC processing
        this._children = [];
    }
}

// wrapper for raw objects and Jet 1.x structs
class JetViewRaw extends JetView {
    constructor(app, config) {
        super(app, config);
        this._ui = config.ui;
    }
    config() {
        return this._ui;
    }
}

class SubRouter {
    constructor(cb, config, app) {
        this.path = "";
        this.app = app;
    }
    set(path, config) {
        this.path = path;
        const a = this.app;
        a.app.getRouter().set(a._segment.append(this.path), { silent: true });
    }
    get() {
        return this.path;
    }
}

let _once = true;
class JetAppBase extends JetBase {
    constructor(config) {
        const webix = (config || {}).webix || window.webix;
        super(webix);
        // init config
        this.config = this.webix.extend({
            name: "App",
            version: "1.0",
            start: "/home"
        }, config, true);
        this.app = this.config.app;
        this.ready = Promise.resolve();
        this._services = {};
        this.webix.extend(this, this.webix.EventSystem);
    }
    getUrl() {
        return this._subSegment.suburl();
    }
    getUrlString() {
        return this._subSegment.toString();
    }
    getService(name) {
        let obj = this._services[name];
        if (typeof obj === "function") {
            obj = this._services[name] = obj(this);
        }
        return obj;
    }
    setService(name, handler) {
        this._services[name] = handler;
    }
    destructor() {
        this.getSubView().destructor();
        super.destructor();
    }
    // copy object and collect extra handlers
    copyConfig(obj, target, config) {
        // raw ui config
        if (obj instanceof JetBase ||
            (typeof obj === "function" && obj.prototype instanceof JetBase)) {
            obj = { $subview: obj };
        }
        // subview placeholder
        if (typeof obj.$subview != "undefined") {
            return this.addSubView(obj, target, config);
        }
        // process sub-properties
        target = target || (obj instanceof Array ? [] : {});
        for (const method in obj) {
            let point = obj[method];
            // view class
            if (typeof point === "function" && point.prototype instanceof JetBase) {
                point = { $subview: point };
            }
            if (point && typeof point === "object" &&
                !(point instanceof this.webix.DataCollection) && !(point instanceof RegExp)) {
                if (point instanceof Date) {
                    target[method] = new Date(point);
                }
                else {
                    const copy = this.copyConfig(point, (point instanceof Array ? [] : {}), config);
                    if (copy !== null) {
                        target[method] = copy;
                    }
                }
            }
            else {
                target[method] = point;
            }
        }
        return target;
    }
    getRouter() {
        return this.$router;
    }
    clickHandler(e) {
        if (e) {
            const target = (e.target || e.srcElement);
            if (target && target.getAttribute) {
                const trigger = target.getAttribute("trigger");
                if (trigger) {
                    this._forView(target, view => view.app.trigger(trigger));
                }
                const route = target.getAttribute("route");
                if (route) {
                    this._forView(target, view => view.show(route));
                }
            }
        }
    }
    getRoot() {
        return this.getSubView().getRoot();
    }
    refresh() {
        if (!this._subSegment) {
            return Promise.resolve(null);
        }
        return this.getSubView().refresh().then(view => {
            this.callEvent("app:route", [this.getUrl()]);
            return view;
        });
    }
    loadView(url) {
        const views = this.config.views;
        let result = null;
        if (url === "") {
            return Promise.resolve(this._loadError("", new Error("Webix Jet: Empty url segment")));
        }
        try {
            if (views) {
                if (typeof views === "function") {
                    // custom loading strategy
                    result = views(url);
                }
                else {
                    // predefined hash
                    result = views[url];
                }
                if (typeof result === "string") {
                    url = result;
                    result = null;
                }
            }
            if (!result) {
                if (url === "_blank") {
                    result = {};
                }
                else {
                    result = this._loadViewDynamic(url);
                }
            }
        }
        catch (e) {
            result = this._loadError(url, e);
        }
        // custom handler can return view or its promise
        if (!result.then) {
            result = Promise.resolve(result);
        }
        // set error handler
        result = result
            .then(module => module.__esModule ? module.default : module)
            .catch(err => this._loadError(url, err));
        return result;
    }
    _forView(target, handler) {
        const view = this.webix.$$(target);
        if (view) {
            handler(view.$scope);
        }
    }
    _loadViewDynamic(url) {
        return null;
    }
    createFromURL(chunk, now) {
        let view;
        if (chunk.isNew || !chunk.view) {
            view = this.loadView(chunk.page)
                .then(ui => this.createView(ui, name));
        }
        else {
            view = Promise.resolve(chunk.view);
        }
        return view;
    }
    createView(ui, name) {
        let obj;
        if (typeof ui === "function") {
            if (ui.prototype instanceof JetAppBase) {
                // UI class
                return new ui({ app: this, name, router: SubRouter });
            }
            else if (ui.prototype instanceof JetBase) {
                // UI class
                return new ui(this, { name });
            }
            else {
                // UI factory functions
                ui = ui(this);
            }
        }
        if (ui instanceof JetBase) {
            obj = ui;
        }
        else {
            // UI object
            obj = new JetViewRaw(this, { name, ui });
        }
        return obj;
    }
    // show view path
    show(url) {
        return this.render(this._container, (url || this.config.start));
    }
    // event helpers
    trigger(name, ...rest) {
        this.apply(name, rest);
    }
    apply(name, data) {
        this.callEvent(name, data);
    }
    action(name) {
        return this.webix.bind(function (...rest) {
            this.apply(name, rest);
        }, this);
    }
    on(name, handler) {
        this.attachEvent(name, handler);
    }
    use(plugin, config) {
        plugin(this, null, config);
    }
    error(name, er) {
        this.callEvent(name, er);
        this.callEvent("app:error", er);
        /* tslint:disable */
        if (this.config.debug) {
            for (var i = 0; i < er.length; i++) {
                console.error(er[i]);
                if (er[i] instanceof Error) {
                    let text = er[i].message;
                    if (text.indexOf("Module build failed") === 0) {
                        text = text.replace(/\x1b\[[0-9;]*m/g, "");
                        document.body.innerHTML = `<pre style='font-size:16px; background-color: #ec6873; color: #000; padding:10px;'>${text}</pre>`;
                    }
                    else {
                        text += "<br><br>Check console for more details";
                        this.webix.message({ type: "error", text: text, expire: -1 });
                    }
                }
            }
            debugger;
        }
        /* tslint:enable */
    }
    // renders top view
    render(root, url, parent) {
        this._container = (typeof root === "string") ?
            this.webix.toNode(root) :
            (root || document.body);
        const firstInit = !this.$router;
        let path = null;
        if (firstInit) {
            if (_once) {
                this.webix.attachEvent("onClick", e => this.clickHandler(e));
                _once = false;
            }
            if (typeof url === "string") {
                url = new Route(url, 0);
            }
            this._subSegment = this._first_start(url);
            this._subSegment.route.linkRouter = true;
        }
        else {
            if (typeof url === "string") {
                path = url;
            }
            else {
                if (this.app) {
                    path = url.split().route.path;
                }
                else {
                    path = url.toString();
                }
            }
        }
        const top = this.getSubView();
        const segment = this._subSegment;
        const ready = segment.show(path, top)
            .then(() => this.createFromURL(segment.current(), top))
            .then(view => view.render(root, segment))
            .then(base => {
            this.$router.set(segment.route.path, { silent: true });
            this.callEvent("app:route", [this.getUrl()]);
            return base;
        });
        this.ready = this.ready.then(() => ready);
        return ready;
    }
    getSubView() {
        if (this._subSegment) {
            const view = this._subSegment.current().view;
            if (view)
                return view;
        }
        return new JetView(this, {});
    }
    _first_start(route) {
        this._segment = route;
        const cb = (a) => setTimeout(() => {
            this.show(a);
        }, 1);
        this.$router = new (this.config.router)(cb, this.config, this);
        // start animation for top-level app
        if (this._container === document.body && this.config.animation !== false) {
            const node = this._container;
            this.webix.html.addCss(node, "webixappstart");
            setTimeout(() => {
                this.webix.html.removeCss(node, "webixappstart");
                this.webix.html.addCss(node, "webixapp");
            }, 10);
        }
        if (!route) {
            // if no url defined, check router first
            let urlString = this.$router.get();
            if (!urlString) {
                urlString = this.config.start;
                this.$router.set(urlString, { silent: true });
            }
            route = new Route(urlString, 0);
        }
        else if (this.app) {
            route.current().view = this;
            if (route.next()) {
                route = route.split();
            }
            else {
                route = new Route(this.config.start, 0);
            }
        }
        return route;
    }
    // error during view resolving
    _loadError(url, err) {
        this.error("app:error:resolve", [err, url]);
        return { template: " " };
    }
    addSubView(obj, target, config) {
        const url = obj.$subview !== true ? obj.$subview : null;
        const name = obj.name || (url ? this.webix.uid() : "default");
        target.id = obj.id || "s" + this.webix.uid();
        const view = config[name] = {
            id: target.id,
            url,
            branch: obj.branch,
            popup: obj.popup
        };
        return view.popup ? null : target;
    }
}

class HashRouter {
    constructor(cb, config) {
        this.config = config || {};
        this._detectPrefix();
        this.cb = cb;
        window.onpopstate = () => this.cb(this.get());
    }
    set(path, config) {
        if (this.config.routes) {
            const compare = path.split("?", 2);
            for (const key in this.config.routes) {
                if (this.config.routes[key] === compare[0]) {
                    path = key + (compare.length > 1 ? "?" + compare[1] : "");
                    break;
                }
            }
        }
        if (this.get() !== path) {
            window.history.pushState(null, null, this.prefix + this.sufix + path);
        }
        if (!config || !config.silent) {
            setTimeout(() => this.cb(path), 1);
        }
    }
    get() {
        let path = this._getRaw().replace(this.prefix, "").replace(this.sufix, "");
        path = path !== "/" ? path : "";
        if (this.config.routes) {
            const compare = path.split("?", 2);
            const key = this.config.routes[compare[0]];
            if (key) {
                path = key + (compare.length > 1 ? "?" + compare[1] : "");
            }
        }
        return path;
    }
    _detectPrefix() {
        // use "#!" for backward compatibility
        const sufix = this.config.routerPrefix;
        this.sufix = "#" + ((typeof sufix === "undefined") ? "!" : sufix);
        this.prefix = document.location.href.split("#", 2)[0];
    }
    _getRaw() {
        return document.location.href;
    }
}

let isPatched = false;
function patch(w) {
    if (isPatched || !w) {
        return;
    }
    isPatched = true;
    // custom promise for IE8
    const win = window;
    if (!win.Promise) {
        win.Promise = w.promise;
    }
    const version = w.version.split(".");
    // will be fixed in webix 5.3
    if (version[0] * 10 + version[1] * 1 < 53) {
        w.ui.freeze = function (handler) {
            // disabled because webix jet 5.0 can't handle resize of scrollview correctly
            // w.ui.$freeze = true;
            const res = handler();
            if (res && res.then) {
                res.then(function (some) {
                    w.ui.$freeze = false;
                    w.ui.resize();
                    return some;
                });
            }
            else {
                w.ui.$freeze = false;
                w.ui.resize();
            }
            return res;
        };
    }
    // adding views as classes
    const baseAdd = w.ui.baselayout.prototype.addView;
    const baseRemove = w.ui.baselayout.prototype.removeView;
    const config = {
        addView(view, index) {
            if (this.$scope && this.$scope.webixJet) {
                const jview = this.$scope;
                const subs = {};
                view = jview.app.copyConfig(view, {}, subs);
                baseAdd.apply(this, [view, index]);
                for (const key in subs) {
                    jview._renderFrame(key, subs[key], null).then(() => {
                        jview._subs[key] = subs[key];
                    });
                }
                return view.id;
            }
            else {
                return baseAdd.apply(this, arguments);
            }
        },
        removeView() {
            baseRemove.apply(this, arguments);
            if (this.$scope && this.$scope.webixJet) {
                const subs = this.$scope._subs;
                // check all sub-views, destroy and clean the removed one
                for (const key in subs) {
                    const test = subs[key];
                    if (!w.$$(test.id)) {
                        test.view.destructor();
                        delete subs[key];
                    }
                }
            }
        }
    };
    w.extend(w.ui.layout.prototype, config, true);
    w.extend(w.ui.baselayout.prototype, config, true);
    // wrapper for using Jet Apps as views
    w.protoUI({
        name: "jetapp",
        $init(cfg) {
            this.$app = new this.app(cfg);
            const id = w.uid().toString();
            cfg.body = { id };
            this.$ready.push(function () {
                this.$app.render({ id });
            });
            for (var key in this.$app) {
                var origin = this.$app[key];
                if (typeof origin === "function" && !this[key]) {
                    this[key] = origin.bind(this.$app);
                }
            }
        }
    }, w.ui.proxy);
}

class JetApp extends JetAppBase {
    constructor(config) {
        config.router = config.router || HashRouter;
        super(config);
        patch(this.webix);
    }
    _loadViewDynamic(url) {
        url = url.replace(/\./g, "/");
        return require("jet-views/" + url);
    }
}

class StoreRouter {
    constructor(cb, config, app) {
        this.storage = config.storage || app.webix.storage.session;
        this.name = (config.storeName || config.id + ":route");
        this.cb = cb;
    }
    set(path, config) {
        this.storage.put(this.name, path);
        if (!config || !config.silent) {
            setTimeout(() => this.cb(path), 1);
        }
    }
    get() {
        return this.storage.get(this.name);
    }
}

class UrlRouter extends HashRouter {
    _detectPrefix() {
        this.prefix = "";
        this.sufix = this.config.routerPrefix || "";
    }
    _getRaw() {
        return document.location.pathname;
    }
}

class EmptyRouter {
    constructor(cb, _$config) {
        this.path = "";
        this.cb = cb;
    }
    set(path, config) {
        this.path = path;
        if (!config || !config.silent) {
            setTimeout(() => this.cb(path), 1);
        }
    }
    get() {
        return this.path;
    }
}

function UnloadGuard(app, view, config) {
    view.on(app, `app:guard`, function (_$url, point, promise) {
        if (point === view || point.contains(view)) {
            const res = config();
            if (res === false) {
                promise.confirm = Promise.reject(res);
            }
            else {
                promise.confirm = promise.confirm.then(() => res);
            }
        }
    });
}

//     (c) 2012-2018 Airbnb, Inc.

// var has = require('has');
function has(store, key) {
  return Object.prototype.hasOwnProperty.call(store, key);
}
// var forEach = require('for-each');
function forEach(obj, handler, context) {
  for (var key in obj) {
    if (has(obj, key)) {
      handler.call((context || obj), obj[key], key, obj);
    }
  }
}
// var trim = require('string.prototype.trim');
function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
// var warning = require('warning');
function warn(message) {
  message = 'Warning: ' + message;
  if (typeof console !== 'undefined') {
    console.error(message);
  }

  try { throw new Error(message); } catch (x) {}
}

var replace = String.prototype.replace;
var split = String.prototype.split;

// #### Pluralization methods
// The string that separates the different phrase possibilities.
var delimiter = '||||';

var russianPluralGroups = function (n) {
  var end = n % 10;
  if (n !== 11 && end === 1) {
    return 0;
  }
  if (2 <= end && end <= 4 && !(n >= 12 && n <= 14)) {
    return 1;
  }
  return 2;
};

// Mapping from pluralization group plural logic.
var pluralTypes = {
  arabic: function (n) {
    // http://www.arabeyes.org/Plural_Forms
    if (n < 3) { return n; }
    var lastTwo = n % 100;
    if (lastTwo >= 3 && lastTwo <= 10) return 3;
    return lastTwo >= 11 ? 4 : 5;
  },
  bosnian_serbian: russianPluralGroups,
  chinese: function () { return 0; },
  croatian: russianPluralGroups,
  french: function (n) { return n > 1 ? 1 : 0; },
  german: function (n) { return n !== 1 ? 1 : 0; },
  russian: russianPluralGroups,
  lithuanian: function (n) {
    if (n % 10 === 1 && n % 100 !== 11) { return 0; }
    return n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19) ? 1 : 2;
  },
  czech: function (n) {
    if (n === 1) { return 0; }
    return (n >= 2 && n <= 4) ? 1 : 2;
  },
  polish: function (n) {
    if (n === 1) { return 0; }
    var end = n % 10;
    return 2 <= end && end <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  },
  icelandic: function (n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; },
  slovenian: function (n) {
    var lastTwo = n % 100;
    if (lastTwo === 1) {
      return 0;
    }
    if (lastTwo === 2) {
      return 1;
    }
    if (lastTwo === 3 || lastTwo === 4) {
      return 2;
    }
    return 3;
  }
};


// Mapping from pluralization group to individual language codes/locales.
// Will look up based on exact match, if not found and it's a locale will parse the locale
// for language code, and if that does not exist will default to 'en'
var pluralTypeToLanguages = {
  arabic: ['ar'],
  bosnian_serbian: ['bs-Latn-BA', 'bs-Cyrl-BA', 'srl-RS', 'sr-RS'],
  chinese: ['id', 'id-ID', 'ja', 'ko', 'ko-KR', 'lo', 'ms', 'th', 'th-TH', 'zh'],
  croatian: ['hr', 'hr-HR'],
  german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hi-IN', 'hu', 'hu-HU', 'it', 'nl', 'no', 'pt', 'sv', 'tr'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['ru', 'ru-RU'],
  lithuanian: ['lt'],
  czech: ['cs', 'cs-CZ', 'sk'],
  polish: ['pl'],
  icelandic: ['is'],
  slovenian: ['sl-SL']
};

function langToTypeMap(mapping) {
  var ret = {};
  forEach(mapping, function (langs, type) {
    forEach(langs, function (lang) {
      ret[lang] = type;
    });
  });
  return ret;
}

function pluralTypeName(locale) {
  var langToPluralType = langToTypeMap(pluralTypeToLanguages);
  return langToPluralType[locale]
    || langToPluralType[split.call(locale, /-/, 1)[0]]
    || langToPluralType.en;
}

function pluralTypeIndex(locale, count) {
  return pluralTypes[pluralTypeName(locale)](count);
}

function escape(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function constructTokenRegex(opts) {
  var prefix = (opts && opts.prefix) || '%{';
  var suffix = (opts && opts.suffix) || '}';

  if (prefix === delimiter || suffix === delimiter) {
    throw new RangeError('"' + delimiter + '" token is reserved for pluralization');
  }

  return new RegExp(escape(prefix) + '(.*?)' + escape(suffix), 'g');
}

var dollarRegex = /\$/g;
var dollarBillsYall = '$$';
var defaultTokenRegex = /%\{(.*?)\}/g;

// ### transformPhrase(phrase, substitutions, locale)
//
// Takes a phrase string and transforms it by choosing the correct
// plural form and interpolating it.
//
//     transformPhrase('Hello, %{name}!', {name: 'Spike'});
//     // "Hello, Spike!"
//
// The correct plural form is selected if substitutions.smart_count
// is set. You can pass in a number instead of an Object as `substitutions`
// as a shortcut for `smart_count`.
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 1}, 'en');
//     // "1 new message"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 2}, 'en');
//     // "2 new messages"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', 5, 'en');
//     // "5 new messages"
//
// You should pass in a third argument, the locale, to specify the correct plural type.
// It defaults to `'en'` with 2 plural forms.
function transformPhrase(phrase, substitutions, locale, tokenRegex) {
  if (typeof phrase !== 'string') {
    throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
  }

  if (substitutions == null) {
    return phrase;
  }

  var result = phrase;
  var interpolationRegex = tokenRegex || defaultTokenRegex;

  // allow number as a pluralization shortcut
  var options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;

  // Select plural form: based on a phrase text that contains `n`
  // plural forms separated by `delimiter`, a `locale`, and a `substitutions.smart_count`,
  // choose the correct plural form. This is only done if `count` is set.
  if (options.smart_count != null && result) {
    var texts = split.call(result, delimiter);
    result = trim(texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]);
  }

  // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
  result = replace.call(result, interpolationRegex, function (expression, argument) {
    if (!has(options, argument) || options[argument] == null) { return expression; }
    // Ensure replacement value is escaped to prevent special $-prefixed regex replace tokens.
    return replace.call(options[argument], dollarRegex, dollarBillsYall);
  });

  return result;
}

// ### Polyglot class constructor
function Polyglot(options) {
  var opts = options || {};
  this.phrases = {};
  this.extend(opts.phrases || {});
  this.currentLocale = opts.locale || 'en';
  var allowMissing = opts.allowMissing ? transformPhrase : null;
  this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
  this.warn = opts.warn || warn;
  this.tokenRegex = constructTokenRegex(opts.interpolation);
}

// ### polyglot.locale([locale])
//
// Get or set locale. Internally, Polyglot only uses locale for pluralization.
Polyglot.prototype.locale = function (newLocale) {
  if (newLocale) this.currentLocale = newLocale;
  return this.currentLocale;
};

// ### polyglot.extend(phrases)
//
// Use `extend` to tell Polyglot how to translate a given key.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The key can be any string.  Feel free to call `extend` multiple times;
// it will override any phrases with the same key, but leave existing phrases
// untouched.
//
// It is also possible to pass nested phrase objects, which get flattened
// into an object with the nested keys concatenated using dot notation.
//
//     polyglot.extend({
//       "nav": {
//         "hello": "Hello",
//         "hello_name": "Hello, %{name}",
//         "sidebar": {
//           "welcome": "Welcome"
//         }
//       }
//     });
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}',
//     //   'nav.sidebar.welcome': 'Welcome'
//     // }
//
// `extend` accepts an optional second argument, `prefix`, which can be used
// to prefix every key in the phrases object with some string, using dot
// notation.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     }, "nav");
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}'
//     // }
//
// This feature is used internally to support nested phrase objects.
Polyglot.prototype.extend = function (morePhrases, prefix) {
  forEach(morePhrases, function (phrase, key) {
    var prefixedKey = prefix ? prefix + '.' + key : key;
    if (typeof phrase === 'object') {
      this.extend(phrase, prefixedKey);
    } else {
      this.phrases[prefixedKey] = phrase;
    }
  }, this);
};

// ### polyglot.unset(phrases)
// Use `unset` to selectively remove keys from a polyglot instance.
//
//     polyglot.unset("some_key");
//     polyglot.unset({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The unset method can take either a string (for the key), or an object hash with
// the keys that you would like to unset.
Polyglot.prototype.unset = function (morePhrases, prefix) {
  if (typeof morePhrases === 'string') {
    delete this.phrases[morePhrases];
  } else {
    forEach(morePhrases, function (phrase, key) {
      var prefixedKey = prefix ? prefix + '.' + key : key;
      if (typeof phrase === 'object') {
        this.unset(phrase, prefixedKey);
      } else {
        delete this.phrases[prefixedKey];
      }
    }, this);
  }
};

// ### polyglot.clear()
//
// Clears all phrases. Useful for special cases, such as freeing
// up memory if you have lots of phrases but no longer need to
// perform any translation. Also used internally by `replace`.
Polyglot.prototype.clear = function () {
  this.phrases = {};
};

// ### polyglot.replace(phrases)
//
// Completely replace the existing phrases with a new set of phrases.
// Normally, just use `extend` to add more phrases, but under certain
// circumstances, you may want to make sure no old phrases are lying around.
Polyglot.prototype.replace = function (newPhrases) {
  this.clear();
  this.extend(newPhrases);
};


// ### polyglot.t(key, options)
//
// The most-used method. Provide a key, and `t` will return the
// phrase.
//
//     polyglot.t("hello");
//     => "Hello"
//
// The phrase value is provided first by a call to `polyglot.extend()` or
// `polyglot.replace()`.
//
// Pass in an object as the second argument to perform interpolation.
//
//     polyglot.t("hello_name", {name: "Spike"});
//     => "Hello, Spike"
//
// If you like, you can provide a default value in case the phrase is missing.
// Use the special option key "_" to specify a default.
//
//     polyglot.t("i_like_to_write_in_language", {
//       _: "I like to write in %{language}.",
//       language: "JavaScript"
//     });
//     => "I like to write in JavaScript."
//
Polyglot.prototype.t = function (key, options) {
  var phrase, result;
  var opts = options == null ? {} : options;
  if (typeof this.phrases[key] === 'string') {
    phrase = this.phrases[key];
  } else if (typeof opts._ === 'string') {
    phrase = opts._;
  } else if (this.onMissingKey) {
    var onMissingKey = this.onMissingKey;
    result = onMissingKey(key, opts, this.currentLocale, this.tokenRegex);
  } else {
    this.warn('Missing translation for key: "' + key + '"');
    result = key;
  }
  if (typeof phrase === 'string') {
    result = transformPhrase(phrase, opts, this.currentLocale, this.tokenRegex);
  }
  return result;
};


// ### polyglot.has(key)
//
// Check if polyglot has a translation for given key
Polyglot.prototype.has = function (key) {
  return has(this.phrases, key);
};

// export transformPhrase
Polyglot.transformPhrase = function transform(phrase, substitutions, locale) {
  return transformPhrase(phrase, substitutions, locale);
};

var webixPolyglot = Polyglot;

function Locale(app, _view, config) {
    config = config || {};
    const storage = config.storage;
    let lang = storage ? (storage.get("lang") || "en") : (config.lang || "en");
    function setLangData(name, data, silent) {
        if (data.__esModule) {
            data = data.default;
        }
        const pconfig = { phrases: data };
        if (config.polyglot) {
            app.webix.extend(pconfig, config.polyglot);
        }
        const poly = service.polyglot = new webixPolyglot(pconfig);
        poly.locale(name);
        service._ = app.webix.bind(poly.t, poly);
        lang = name;
        if (storage) {
            storage.put("lang", lang);
        }
        if (config.webix) {
            const locName = config.webix[name];
            if (locName) {
                app.webix.i18n.setLocale(locName);
            }
        }
        if (!silent) {
            return app.refresh();
        }
        return Promise.resolve();
    }
    function getLang() { return lang; }
    function setLang(name, silent) {
        // ignore setLang if loading by path is disabled
        if (config.path === false) {
            return;
        }
        const path = (config.path ? config.path + "/" : "") + name;
        const data = require("jet-locales/" + path);
        setLangData(name, data, silent);
    }
    const service = {
        getLang, setLang, setLangData, _: null, polyglot: null
    };
    app.setService("locale", service);
    setLang(lang, true);
}

function show(view, config, value) {
    if (config.urls) {
        value = config.urls[value] || value;
    }
    else if (config.param) {
        value = { [config.param]: value };
    }
    view.show(value);
}
function Menu(app, view, config) {
    const frame = view.getSubViewInfo().parent;
    const ui = view.$$(config.id || config);
    let silent = false;
    ui.attachEvent("onchange", function () {
        if (!silent) {
            show(frame, config, this.getValue());
        }
    });
    ui.attachEvent("onafterselect", function () {
        if (!silent) {
            let id = null;
            if (ui.setValue) {
                id = this.getValue();
            }
            else if (ui.getSelectedId) {
                id = ui.getSelectedId();
            }
            show(frame, config, id);
        }
    });
    view.on(app, `app:route`, function () {
        let name = "";
        if (config.param) {
            name = view.getParam(config.param, true);
        }
        else {
            const segment = frame.getUrl()[1];
            if (segment) {
                name = segment.page;
            }
        }
        if (name) {
            silent = true;
            if (ui.setValue && ui.getValue() !== name) {
                ui.setValue(name);
            }
            else if (ui.select && ui.exists(name) && ui.getSelectedId() !== name) {
                ui.select(name);
            }
            silent = false;
        }
    });
}

const baseicons = {
    good: "check",
    error: "warning",
    saving: "refresh fa-spin"
};
const basetext = {
    good: "Ok",
    error: "Error",
    saving: "Connecting..."
};
function Status(app, view, config) {
    let status = "good";
    let count = 0;
    let iserror = false;
    let expireDelay = config.expire;
    if (!expireDelay && expireDelay !== false) {
        expireDelay = 2000;
    }
    const texts = config.texts || basetext;
    const icons = config.icons || baseicons;
    if (typeof config === "string") {
        config = { target: config };
    }
    function refresh(content) {
        const area = view.$$(config.target);
        if (area) {
            if (!content) {
                content = "<div class='status_" +
                    status +
                    "'><span class='webix_icon fa-" +
                    icons[status] + "'></span> " + texts[status] + "</div>";
            }
            area.setHTML(content);
        }
    }
    function success() {
        count--;
        setStatus("good");
    }
    function fail(err) {
        count--;
        setStatus("error", err);
    }
    function start(promise) {
        count++;
        setStatus("saving");
        if (promise && promise.then) {
            promise.then(success, fail);
        }
    }
    function getStatus() {
        return status;
    }
    function hideStatus() {
        if (count === 0) {
            refresh(" ");
        }
    }
    function setStatus(mode, err) {
        if (count < 0) {
            count = 0;
        }
        if (mode === "saving") {
            status = "saving";
            refresh();
        }
        else {
            iserror = (mode === "error");
            if (count === 0) {
                status = iserror ? "error" : "good";
                if (iserror) {
                    app.error("app:error:server", [err.responseText || err]);
                }
                else {
                    if (expireDelay) {
                        setTimeout(hideStatus, expireDelay);
                    }
                }
                refresh();
            }
        }
    }
    function track(data) {
        const dp = app.webix.dp(data);
        if (dp) {
            view.on(dp, "onAfterDataSend", start);
            view.on(dp, "onAfterSaveError", (_id, _obj, response) => fail(response));
            view.on(dp, "onAfterSave", success);
        }
    }
    app.setService("status", {
        getStatus,
        setStatus,
        track
    });
    if (config.remote) {
        view.on(app.webix, "onRemoteCall", start);
    }
    if (config.ajax) {
        view.on(app.webix, "onBeforeAjax", (_mode, _url, _data, _request, _headers, _files, promise) => {
            start(promise);
        });
    }
    if (config.data) {
        track(config.data);
    }
}

function Theme(app, _view, config) {
    config = config || {};
    const storage = config.storage;
    let theme = storage ?
        (storage.get("theme") || "flat-default")
        :
            (config.theme || "flat-default");
    const service = {
        getTheme() { return theme; },
        setTheme(name, silent) {
            const parts = name.split("-");
            const links = document.getElementsByTagName("link");
            for (let i = 0; i < links.length; i++) {
                const lname = links[i].getAttribute("title");
                if (lname) {
                    if (lname === name || lname === parts[0]) {
                        links[i].disabled = false;
                    }
                    else {
                        links[i].disabled = true;
                    }
                }
            }
            app.webix.skin.set(parts[0]);
            // remove old css
            app.webix.html.removeCss(document.body, "theme-" + theme);
            // add new css
            app.webix.html.addCss(document.body, "theme-" + name);
            theme = name;
            if (storage) {
                storage.put("theme", name);
            }
            if (!silent) {
                app.refresh();
            }
        }
    };
    app.setService("theme", service);
    service.setTheme(theme, true);
}

function copyParams(data, url, route) {
    for (let i = 0; i < route.length; i++) {
        data[route[i]] = url[i + 1] ? url[i + 1].page : "";
    }
}
function UrlParam(app, view, config) {
    const route = config.route || config;
    const data = {};
    view.on(app, "app:urlchange", function (subview, segment) {
        if (view === subview) {
            copyParams(data, segment.suburl(), route);
            segment.size(route.length + 1);
        }
    });
    const os = view.setParam;
    const og = view.getParam;
    view.setParam = function (name, value, show) {
        const index = route.indexOf(name);
        if (index >= 0) {
            data[name] = value;
            this._segment.update("", value, index + 1);
            if (show) {
                return view.show(null);
            }
        }
        else {
            return os.call(this, name, value, show);
        }
    };
    view.getParam = function (key, mode) {
        const val = data[key];
        if (typeof val !== "undefined") {
            return val;
        }
        return og.call(this, key, mode);
    };
    copyParams(data, view.getUrl(), route);
}

function User(app, _view, config) {
    config = config || {};
    const login = config.login || "/login";
    const logout = config.logout || "/logout";
    const afterLogin = config.afterLogin || app.config.start;
    const afterLogout = config.afterLogout || "/login";
    const ping = config.ping || 5 * 60 * 1000;
    const model = config.model;
    let user = config.user;
    const service = {
        getUser() {
            return user;
        },
        getStatus(server) {
            if (!server) {
                return user !== null;
            }
            return model.status().catch(() => null).then(data => {
                user = data;
            });
        },
        login(name, pass) {
            return model.login(name, pass).then(data => {
                user = data;
                if (!data) {
                    throw new Error("Access denied");
                }
                app.callEvent("app:user:login", [user]);
                app.show(afterLogin);
            });
        },
        logout() {
            user = null;
            return model.logout().then(res => {
                app.callEvent("app:user:logout", []);
                return res;
            });
        }
    };
    function canNavigate(url, obj) {
        if (url === logout) {
            service.logout();
            obj.redirect = afterLogout;
        }
        else if (url !== login && !service.getStatus()) {
            obj.redirect = login;
        }
    }
    app.setService("user", service);
    app.attachEvent(`app:guard`, function (url, _$root, obj) {
        if (config.public && config.public(url)) {
            return true;
        }
        if (typeof user === "undefined") {
            obj.confirm = service.getStatus(true).then(() => canNavigate(url, obj));
        }
        return canNavigate(url, obj);
    });
    if (ping) {
        setInterval(() => service.getStatus(true), ping);
    }
}

/*
MIT License
Copyright (c) 2019 XB Software
*/
let webix = window.webix;
if (webix) {
    patch(webix);
}
const plugins = {
    UnloadGuard, Locale, Menu, Theme, User, Status, UrlParam
};
const w = window;
if (!w.Promise) {
    w.Promise = w.webix.promise;
}

export { plugins, JetApp, JetView, HashRouter, StoreRouter, UrlRouter, EmptyRouter, SubRouter };
//# sourceMappingURL=jet.js.map
