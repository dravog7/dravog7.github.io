
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function () {
    'use strict';

    function noop() {}

    function assign(tar, src) {
    	for (const k in src) tar[k] = src[k];
    	return tar;
    }

    function add_location(element, file, line, column, char) {
    	element.__svelte_meta = {
    		loc: { file, line, column, char }
    	};
    }

    function run(fn) {
    	return fn();
    }

    function blank_object() {
    	return Object.create(null);
    }

    function run_all(fns) {
    	fns.forEach(run);
    }

    function is_function(thing) {
    	return typeof thing === 'function';
    }

    function safe_not_equal(a, b) {
    	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function validate_store(store, name) {
    	if (!store || typeof store.subscribe !== 'function') {
    		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    	}
    }

    function subscribe(component, store, callback) {
    	const unsub = store.subscribe(callback);

    	component.$$.on_destroy.push(unsub.unsubscribe
    		? () => unsub.unsubscribe()
    		: unsub);
    }

    function create_slot(definition, ctx, fn) {
    	if (definition) {
    		const slot_ctx = get_slot_context(definition, ctx, fn);
    		return definition[0](slot_ctx);
    	}
    }

    function get_slot_context(definition, ctx, fn) {
    	return definition[1]
    		? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
    		: ctx.$$scope.ctx;
    }

    function get_slot_changes(definition, ctx, changed, fn) {
    	return definition[1]
    		? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
    		: ctx.$$scope.changed || {};
    }

    function append(target, node) {
    	target.appendChild(node);
    }

    function insert(target, node, anchor) {
    	target.insertBefore(node, anchor || null);
    }

    function detach(node) {
    	node.parentNode.removeChild(node);
    }

    function element(name) {
    	return document.createElement(name);
    }

    function text(data) {
    	return document.createTextNode(data);
    }

    function empty() {
    	return text('');
    }

    function listen(node, event, handler, options) {
    	node.addEventListener(event, handler, options);
    	return () => node.removeEventListener(event, handler, options);
    }

    function children(element) {
    	return Array.from(element.childNodes);
    }

    function toggle_class(element, name, toggle) {
    	element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;

    function set_current_component(component) {
    	current_component = component;
    }

    function get_current_component() {
    	if (!current_component) throw new Error(`Function called outside component initialization`);
    	return current_component;
    }

    function onMount(fn) {
    	get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];

    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];

    function schedule_update() {
    	if (!update_scheduled) {
    		update_scheduled = true;
    		resolved_promise.then(flush);
    	}
    }

    function add_render_callback(fn) {
    	render_callbacks.push(fn);
    }

    function flush() {
    	const seen_callbacks = new Set();

    	do {
    		// first, call beforeUpdate functions
    		// and update components
    		while (dirty_components.length) {
    			const component = dirty_components.shift();
    			set_current_component(component);
    			update(component.$$);
    		}

    		while (binding_callbacks.length) binding_callbacks.shift()();

    		// then, once components are updated, call
    		// afterUpdate functions. This may cause
    		// subsequent updates...
    		while (render_callbacks.length) {
    			const callback = render_callbacks.pop();
    			if (!seen_callbacks.has(callback)) {
    				callback();

    				// ...so guard against infinite loops
    				seen_callbacks.add(callback);
    			}
    		}
    	} while (dirty_components.length);

    	while (flush_callbacks.length) {
    		flush_callbacks.pop()();
    	}

    	update_scheduled = false;
    }

    function update($$) {
    	if ($$.fragment) {
    		$$.update($$.dirty);
    		run_all($$.before_render);
    		$$.fragment.p($$.dirty, $$.ctx);
    		$$.dirty = null;

    		$$.after_render.forEach(add_render_callback);
    	}
    }

    let outros;

    function group_outros() {
    	outros = {
    		remaining: 0,
    		callbacks: []
    	};
    }

    function check_outros() {
    	if (!outros.remaining) {
    		run_all(outros.callbacks);
    	}
    }

    function on_outro(callback) {
    	outros.callbacks.push(callback);
    }

    function mount_component(component, target, anchor) {
    	const { fragment, on_mount, on_destroy, after_render } = component.$$;

    	fragment.m(target, anchor);

    	// onMount happens after the initial afterUpdate. Because
    	// afterUpdate callbacks happen in reverse order (inner first)
    	// we schedule onMount callbacks before afterUpdate callbacks
    	add_render_callback(() => {
    		const new_on_destroy = on_mount.map(run).filter(is_function);
    		if (on_destroy) {
    			on_destroy.push(...new_on_destroy);
    		} else {
    			// Edge case - component was destroyed immediately,
    			// most likely as a result of a binding initialising
    			run_all(new_on_destroy);
    		}
    		component.$$.on_mount = [];
    	});

    	after_render.forEach(add_render_callback);
    }

    function destroy(component, detaching) {
    	if (component.$$) {
    		run_all(component.$$.on_destroy);
    		component.$$.fragment.d(detaching);

    		// TODO null out other refs, including component.$$ (but need to
    		// preserve final state?)
    		component.$$.on_destroy = component.$$.fragment = null;
    		component.$$.ctx = {};
    	}
    }

    function make_dirty(component, key) {
    	if (!component.$$.dirty) {
    		dirty_components.push(component);
    		schedule_update();
    		component.$$.dirty = blank_object();
    	}
    	component.$$.dirty[key] = true;
    }

    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
    	const parent_component = current_component;
    	set_current_component(component);

    	const props = options.props || {};

    	const $$ = component.$$ = {
    		fragment: null,
    		ctx: null,

    		// state
    		props: prop_names,
    		update: noop,
    		not_equal: not_equal$$1,
    		bound: blank_object(),

    		// lifecycle
    		on_mount: [],
    		on_destroy: [],
    		before_render: [],
    		after_render: [],
    		context: new Map(parent_component ? parent_component.$$.context : []),

    		// everything else
    		callbacks: blank_object(),
    		dirty: null
    	};

    	let ready = false;

    	$$.ctx = instance
    		? instance(component, props, (key, value) => {
    			if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
    				if ($$.bound[key]) $$.bound[key](value);
    				if (ready) make_dirty(component, key);
    			}
    		})
    		: props;

    	$$.update();
    	ready = true;
    	run_all($$.before_render);
    	$$.fragment = create_fragment($$.ctx);

    	if (options.target) {
    		if (options.hydrate) {
    			$$.fragment.l(children(options.target));
    		} else {
    			$$.fragment.c();
    		}

    		if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
    		mount_component(component, options.target, options.anchor);
    		flush();
    	}

    	set_current_component(parent_component);
    }

    class SvelteComponent {
    	$destroy() {
    		destroy(this, true);
    		this.$destroy = noop;
    	}

    	$on(type, callback) {
    		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
    		callbacks.push(callback);

    		return () => {
    			const index = callbacks.indexOf(callback);
    			if (index !== -1) callbacks.splice(index, 1);
    		};
    	}

    	$set() {
    		// overridden by instance, if it has props
    	}
    }

    class SvelteComponentDev extends SvelteComponent {
    	constructor(options) {
    		if (!options || (!options.target && !options.$$inline)) {
    			throw new Error(`'target' is a required option`);
    		}

    		super();
    	}

    	$destroy() {
    		super.$destroy();
    		this.$destroy = () => {
    			console.warn(`Component was already destroyed`); // eslint-disable-line no-console
    		};
    	}
    }

    function noop$1() {}

    function run$1(fn) {
    	return fn();
    }

    function run_all$1(fns) {
    	fns.forEach(run$1);
    }

    function safe_not_equal$1(a, b) {
    	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal$1(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe$$1(run$$1, invalidate = noop$1) {
            const subscriber = [run$$1, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop$1;
            }
            run$$1(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe: subscribe$$1 };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop$1;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = result || noop$1;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all$1(unsubscribers);
                cleanup();
            };
        });
    }
    function get(store) {
        let value;
        store.subscribe((_) => value = _)();
        return value;
    }

    var store = /*#__PURE__*/Object.freeze({
        readable: readable,
        writable: writable,
        derived: derived,
        get: get
    });

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var require$$0 = getCjsExportFromNamespace(store);

    const writable$1 = require$$0.writable;

    const router = writable$1({});

    function set(route) {
      router.set(route);
    }

    function remove() {
      router.set({});
    }

    const activeRoute = {
      subscribe: router.subscribe,
      set,
      remove
    };

    var store$1 = { activeRoute };
    var store_1 = store$1.activeRoute;

    const UrlParser = (urlString, namedUrl = "") => {
      const urlBase = new URL(urlString);

      /**
       * Wrapper for URL.host
       *
       **/
      function host() {
        return urlBase.host;
      }

      /**
       * Wrapper for URL.hostname
       *
       **/
      function hostname() {
        return urlBase.hostname;
      }

      /**
       * Returns an object with all the named params and their values
       *
       **/
      function namedParams() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values[paramKey.value] = allPathName[paramKey.index];
          return values;
        }, {});
      }

      /**
       * Returns an array with all the named param keys
       *
       **/
      function namedParamsKeys() {
        const allNamedParamsKeys = namedParamsWithIndex(namedUrl);

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(paramKey.value);
          return values;
        }, []);
      }

      /**
       * Returns an array with all the named param values
       *
       **/
      function namedParamsValues() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(allPathName[paramKey.index]);
          return values;
        }, []);
      }

      /**
       * Returns an array with all named param ids and their position in the path
       * Private
       **/
      function namedParamsWithIndex() {
        const namedUrlParams = getPathNames(namedUrl);

        return namedUrlParams.reduce((validParams, param, index) => {
          if (param[0] === ":") {
            validParams.push({ value: param.slice(1), index });
          }
          return validParams;
        }, []);
      }

      /**
       * Wrapper for URL.port
       *
       **/
      function port() {
        return urlBase.port;
      }

      /**
       * Wrapper for URL.pathname
       *
       **/
      function pathname() {
        return urlBase.pathname;
      }

      /**
       * Wrapper for URL.protocol
       *
       **/
      function protocol() {
        return urlBase.protocol;
      }

      /**
       * Wrapper for URL.search
       *
       **/
      function search() {
        return urlBase.search;
      }

      /**
       * Returns an object with all query params and their values
       *
       **/
      function queryParams() {
        const params = {};
        urlBase.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return params;
      }

      /**
       * Returns an array with all the query param keys
       *
       **/
      function queryParamsKeys() {
        const params = [];
        urlBase.searchParams.forEach((_value, key) => {
          params.push(key);
        });

        return params;
      }

      /**
       * Returns an array with all the query param values
       *
       **/
      function queryParamsValues() {
        const params = [];
        urlBase.searchParams.forEach(value => {
          params.push(value);
        });

        return params;
      }

      /**
       * Returns an array with all the elements of a pathname
       *
       **/
      function pathNames() {
        return getPathNames(urlBase.pathname);
      }

      /**
       * Returns an array with all the parts of a pathname
       * Private method
       **/
      function getPathNames(pathName) {
        if (pathName === "/" || pathName.trim().length === 0) return [pathName];
        if (pathName.slice(-1) === "/") {
          pathName = pathName.slice(0, -1);
        }
        if (pathName[0] === "/") {
          pathName = pathName.slice(1);
        }

        return pathName.split("/");
      }

      return Object.freeze({
        host: host(),
        hostname: hostname(),
        namedParams: namedParams(),
        namedParamsKeys: namedParamsKeys(),
        namedParamsValues: namedParamsValues(),
        pathNames: pathNames(),
        port: port(),
        pathname: pathname(),
        protocol: protocol(),
        search: search(),
        queryParams: queryParams(),
        queryParamsKeys: queryParamsKeys(),
        queryParamsValues: queryParamsValues()
      });
    };

    var url_parser = { UrlParser };

    const UrlParser$1 = url_parser.UrlParser;

    var urlParamsParser = {
      UrlParser: UrlParser$1
    };

    /**
     * Returns true if object has any nested routes empty
     * @param routeObject
     **/
    function anyEmptyNestedRoutes(routeObject) {
      let result = false;
      if (Object.keys(routeObject).length === 0) {
        return true
      }

      if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
        result = true;
      } else if (routeObject.childRoute) {
        result = anyEmptyNestedRoutes(routeObject.childRoute);
      }

      return result
    }

    /**
     * Compare two routes ignoring named params
     * @param pathName string
     * @param routeName string
     **/

    function compareRoutes(pathName, routeName) {
      routeName = removeSlash(routeName);

      if (routeName.includes(':')) {
        return routeName.includes(pathName)
      } else {
        return routeName.startsWith(pathName)
      }
    }

    /**
     * Returns a boolean indicating if the name of path exists in the route based on the language parameter
     * @param pathName string
     * @param route object
     * @param language string
     **/

    function findLocalisedRoute(pathName, route, language) {
      let exists = false;

      if (language) {
        return { exists: route.lang && route.lang[language] && route.lang[language].includes(pathName), language }
      }

      exists = compareRoutes(pathName, route.name);

      if (!exists && route.lang && typeof route.lang === 'object') {
        for (const [key, value] of Object.entries(route.lang)) {
          if (compareRoutes(pathName, value)) {
            exists = true;
            language = key;
          }
        }
      }

      return { exists, language }
    }

    /**
     * Return all the consecutive named param (placeholders) of a pathname
     * @param pathname
     **/
    function getNamedParams(pathName = '') {
      if (pathName.trim().length === 0) return []
      const namedUrlParams = getPathNames(pathName);
      return namedUrlParams.reduce((validParams, param) => {
        if (param[0] === ':') {
          validParams.push(param.slice(1));
        }

        return validParams
      }, [])
    }

    /**
     * Split a pathname based on /
     * @param pathName
     * Private method
     **/
    function getPathNames(pathName) {
      if (pathName === '/' || pathName.trim().length === 0) return [pathName]

      pathName = removeSlash(pathName, 'both');

      return pathName.split('/')
    }

    /**
     * Return the first part of a pathname until the first named param is found
     * @param name
     **/
    function nameToPath(name = '') {
      let routeName;
      if (name === '/' || name.trim().length === 0) return name
      name = removeSlash(name, 'lead');
      routeName = name.split(':')[0];
      routeName = removeSlash(routeName, 'trail');

      return routeName.toLowerCase()
    }

    /**
     * Return the path name including query params
     * @param name
     **/
    function pathWithQueryParams(currentRoute) {
      let queryParams = [];
      if (currentRoute.queryParams) {
        for (let [key, value] of Object.entries(currentRoute.queryParams)) {
          queryParams.push(`${key}=${value}`);
        }
      }

      if (queryParams.length > 0) {
        return `${currentRoute.path}?${queryParams.join('&')}`
      } else {
        return currentRoute.path
      }
    }

    /**
     * Returns a string with trailing or leading slash character removed
     * @param pathName string
     * @param position string - lead, trail, both
     **/
    function removeExtraPaths(pathNames, basePathNames) {
      const names = basePathNames.split('/');
      if (names.length > 1) {
        names.forEach(function(name, index) {
          if (name.length > 0 && index > 0) {
            pathNames.shift();
          }
        });
      }

      return pathNames
    }

    /**
     * Returns a string with trailing or leading slash character removed
     * @param pathName string
     * @param position string - lead, trail, both
     **/

    function removeSlash(pathName, position = 'lead') {
      if (pathName.trim().length < 1) {
        return ''
      }

      if (position === 'trail' || position === 'both') {
        if (pathName.slice(-1) === '/') {
          pathName = pathName.slice(0, -1);
        }
      }

      if (position === 'lead' || position === 'both') {
        if (pathName[0] === '/') {
          pathName = pathName.slice(1);
        }
      }

      return pathName
    }

    /**
     * Returns the name of the route based on the language parameter
     * @param route object
     * @param language string
     **/

    function routeNameLocalised(route, language = null) {
      if (!language || !route.lang || !route.lang[language]) {
        return route.name
      } else {
        return route.lang[language]
      }
    }

    /**
     * Updates the base route path.
     * Route objects can have nested routes (childRoutes) or just a long name like "admin/employees/show/:id"
     *
     * @param basePath string
     * @param pathNames array
     * @param route object
     * @param language string
     **/

    function updateRoutePath(basePath, pathNames, route, language, convert = false) {
      if (basePath === '/' || basePath.trim().length === 0) return { result: basePath, language: null }

      let basePathResult = basePath;
      let routeName = route.name;
      let currentLanguage = language;

      if (convert) {
        currentLanguage = '';
      }

      routeName = removeSlash(routeName);
      basePathResult = removeSlash(basePathResult);

      if (!route.childRoute) {
        let localisedRoute = findLocalisedRoute(basePathResult, route, currentLanguage);

        if (localisedRoute.exists && convert) {
          basePathResult = routeNameLocalised(route, language);
        }

        let routeNames = routeName.split(':')[0];
        routeNames = removeSlash(routeNames, 'trail');
        routeNames = routeNames.split('/');
        routeNames.shift();
        routeNames.forEach(() => {
          const currentPathName = pathNames[0];
          localisedRoute = findLocalisedRoute(`${basePathResult}/${currentPathName}`, route, currentLanguage);

          if (currentPathName && localisedRoute.exists) {
            if (convert) {
              basePathResult = routeNameLocalised(route, language);
            } else {
              basePathResult = `${basePathResult}/${currentPathName}`;
            }
            pathNames.shift();
          } else {
            return { result: basePathResult, language: localisedRoute.language }
          }
        });
        return { result: basePathResult, language: localisedRoute.language }
      } else {
        return { result: basePath, language: currentLanguage }
      }
    }

    var utils = {
      anyEmptyNestedRoutes,
      compareRoutes,
      findLocalisedRoute,
      getNamedParams,
      getPathNames,
      nameToPath,
      pathWithQueryParams,
      removeExtraPaths,
      removeSlash,
      routeNameLocalised,
      updateRoutePath
    };

    const { UrlParser: UrlParser$2 } = urlParamsParser;

    const { pathWithQueryParams: pathWithQueryParams$1, removeSlash: removeSlash$1 } = utils;

    function RouterCurrent(trackPage) {
      const trackPageview = trackPage || false;
      let activeRoute = '';

      function setActive(newRoute) {
        activeRoute = newRoute.path;
        pushActiveRoute(newRoute);
      }

      function active() {
        return activeRoute
      }

      /**
       * Returns true if pathName is current active route
       * @param pathName String The path name to check against the current route.
       * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
       **/
      function isActive(queryPath, includePath = false) {
        if (queryPath[0] !== '/') {
          queryPath = '/' + queryPath;
        }

        // remove query params for comparison
        let pathName = UrlParser$2(`http://fake.com${queryPath}`).pathname;
        let activeRoutePath = UrlParser$2(`http://fake.com${activeRoute}`).pathname;

        pathName = removeSlash$1(pathName, 'trail');

        activeRoutePath = removeSlash$1(activeRoutePath, 'trail');

        if (includePath) {
          return activeRoutePath.includes(pathName)
        } else {
          return activeRoutePath === pathName
        }
      }

      function pushActiveRoute(newRoute) {
        if (typeof window !== 'undefined') {
          const pathAndSearch = pathWithQueryParams$1(newRoute);
          window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
          if (trackPageview) {
            gaTracking(pathAndSearch);
          }
        }
      }

      function gaTracking(newPage) {
        if (typeof ga !== 'undefined') {
          ga('set', 'page', newPage);
          ga('send', 'pageview');
        }
      }

      return Object.freeze({ active, isActive, setActive })
    }

    var current = { RouterCurrent };

    function RouterGuard(onlyIf) {
      const guardInfo = onlyIf;

      function valid() {
        return guardInfo && guardInfo.guard && typeof guardInfo.guard === 'function'
      }

      function redirect() {
        return !guardInfo.guard()
      }

      function redirectPath() {
        let destinationUrl = '/';
        if (guardInfo.redirect && guardInfo.redirect.length > 0) {
          destinationUrl = guardInfo.redirect;
        }

        return destinationUrl
      }

      return Object.freeze({ valid, redirect, redirectPath })
    }

    var guard = { RouterGuard };

    const { RouterGuard: RouterGuard$1 } = guard;

    function RouterRedirect(route, currentPath) {
      const guard = RouterGuard$1(route.onlyIf);

      function path() {
        let redirectTo = currentPath;
        if (route.redirectTo && route.redirectTo.length > 0) {
          redirectTo = route.redirectTo;
        }

        if (guard.valid() && guard.redirect()) {
          redirectTo = guard.redirectPath();
        }

        return redirectTo
      }

      return Object.freeze({ path })
    }

    var redirect = { RouterRedirect };

    const { UrlParser: UrlParser$3 } = urlParamsParser;

    function RouterRoute({ routeInfo, path, routeNamedParams, urlParser, namedPath, language }) {
      function namedParams() {
        const parsedParams = UrlParser$3(`https://fake.com${urlParser.pathname}`, namedPath).namedParams;

        return { ...routeNamedParams, ...parsedParams }
      }

      function get() {
        return {
          name: path,
          component: routeInfo.component,
          layout: routeInfo.layout,
          queryParams: urlParser.queryParams,
          namedParams: namedParams(),
          path,
          language
        }
      }

      return Object.freeze({ get, namedParams })
    }

    var route = { RouterRoute };

    const { updateRoutePath: updateRoutePath$1, getNamedParams: getNamedParams$1, nameToPath: nameToPath$1, removeExtraPaths: removeExtraPaths$1, routeNameLocalised: routeNameLocalised$1 } = utils;

    function RouterPath({ basePath, basePathName, pathNames, convert, currentLanguage }) {
      let updatedPathRoute;
      let route;
      let routePathLanguage = currentLanguage;

      function updatedPath(currentRoute) {
        route = currentRoute;
        updatedPathRoute = updateRoutePath$1(basePathName, pathNames, route, routePathLanguage, convert);
        routePathLanguage = convert ? currentLanguage : updatedPathRoute.language;

        return updatedPathRoute
      }

      function localisedPathName() {
        return routeNameLocalised$1(route, routePathLanguage)
      }

      function localisedRouteWithoutNamedParams() {
        return nameToPath$1(localisedPathName())
      }

      function basePathNameWithoutNamedParams() {
        return nameToPath$1(updatedPathRoute.result)
      }

      function namedPath() {
        const localisedPath = localisedPathName();

        return basePath ? `${basePath}/${localisedPath}` : localisedPath
      }

      function routePath() {
        let routePathValue = `${basePath}/${basePathNameWithoutNamedParams()}`;
        if (routePathValue === '//') {
          routePathValue = '/';
        }

        if (routePathLanguage) {
          pathNames = removeExtraPaths$1(pathNames, localisedRouteWithoutNamedParams());
        }

        const namedParams = getNamedParams$1(localisedPathName());
        if (namedParams && namedParams.length > 0) {
          namedParams.forEach(function() {
            if (pathNames.length > 0) {
              routePathValue += `/${pathNames.shift()}`;
            }
          });
        }

        return routePathValue
      }

      function routeLanguage() {
        return routePathLanguage
      }

      function basePathSameAsLocalised() {
        return basePathNameWithoutNamedParams() === localisedRouteWithoutNamedParams()
      }

      return Object.freeze({
        basePathSameAsLocalised,
        updatedPath,
        basePathNameWithoutNamedParams,
        localisedPathName,
        localisedRouteWithoutNamedParams,
        namedPath,
        pathNames,
        routeLanguage,
        routePath
      })
    }

    var path = { RouterPath };

    const { UrlParser: UrlParser$4 } = urlParamsParser;

    const { RouterRedirect: RouterRedirect$1 } = redirect;
    const { RouterRoute: RouterRoute$1 } = route;
    const { RouterPath: RouterPath$1 } = path;
    const { anyEmptyNestedRoutes: anyEmptyNestedRoutes$1, pathWithQueryParams: pathWithQueryParams$2 } = utils;

    const NotFoundPage = '/404.html';

    function RouterFinder(routes, currentUrl, language, convert) {
      let redirectTo = '';
      let routeNamedParams = {};
      const urlParser = UrlParser$4(currentUrl);

      function findActiveRoute() {
        let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames, language, convert);

        if (!searchActiveRoute || !Object.keys(searchActiveRoute).length || anyEmptyNestedRoutes$1(searchActiveRoute)) {
          if (typeof window !== 'undefined') {
            searchActiveRoute = { name: '404', component: '', path: '404', redirectTo: NotFoundPage };
          }
        } else {
          searchActiveRoute.path = pathWithQueryParams$2(searchActiveRoute);
        }

        return searchActiveRoute
      }

      /**
       * Gets an array of routes and the browser pathname and return the active route
       * @param routes
       * @param basePath
       * @param pathNames
       **/
      function searchActiveRoutes(routes, basePath, pathNames, currentLanguage, convert) {
        let currentRoute = {};
        let basePathName = pathNames.shift().toLowerCase();
        const routerPath = RouterPath$1({ basePath, basePathName, pathNames, convert, currentLanguage });

        routes.forEach(function(route) {
          routerPath.updatedPath(route);
          if (routerPath.basePathSameAsLocalised()) {
            let routePath = routerPath.routePath();

            redirectTo = RouterRedirect$1(route, redirectTo).path();

            if (currentRoute.name !== routePath) {
              currentRoute = setCurrentRoute({
                route,
                routePath,
                routeLanguage: routerPath.routeLanguage(),
                urlParser,
                namedPath: routerPath.namedPath()
              });
            }

            if (route.nestedRoutes && route.nestedRoutes.length > 0 && routerPath.pathNames.length > 0) {
              currentRoute.childRoute = searchActiveRoutes(
                route.nestedRoutes,
                routePath,
                routerPath.pathNames,
                routerPath.routeLanguage(),
                convert
              );
              currentRoute.path = currentRoute.childRoute.path;
              currentRoute.language = currentRoute.childRoute.language;
            } else if (nestedRoutesAndNoPath(route, routerPath.pathNames)) {
              const indexRoute = searchActiveRoutes(
                route.nestedRoutes,
                routePath,
                ['index'],
                routerPath.routeLanguage(),
                convert
              );
              if (indexRoute && Object.keys(indexRoute).length > 0) {
                currentRoute.childRoute = indexRoute;
                currentRoute.language = currentRoute.childRoute.language;
              }
            }
          }
        });

        if (redirectTo) {
          currentRoute.redirectTo = redirectTo;
        }

        return currentRoute
      }

      function nestedRoutesAndNoPath(route, pathNames) {
        return route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0
      }

      function setCurrentRoute({ route, routePath, routeLanguage, urlParser, namedPath }) {
        const routerRoute = RouterRoute$1({
          routeInfo: route,
          urlParser,
          path: routePath,
          routeNamedParams,
          namedPath,
          language: routeLanguage
        });
        routeNamedParams = routerRoute.namedParams();

        return routerRoute.get()
      }

      return Object.freeze({ findActiveRoute })
    }

    var finder = { RouterFinder };

    const { activeRoute: activeRoute$1 } = store$1;
    const { RouterCurrent: RouterCurrent$1 } = current;
    const { RouterFinder: RouterFinder$1 } = finder;
    const { removeSlash: removeSlash$2 } = utils;

    const NotFoundPage$1 = '/404.html';

    let userDefinedRoutes = [];
    let routerOptions = {};
    let routerCurrent;

    /**
     * Object exposes one single property: activeRoute
     * @param routes  Array of routes
     * @param currentUrl current url
     * @param options configuration options
     **/
    function SpaRouter(routes, currentUrl, options = {}) {
      routerOptions = { ...options };
      if (typeof currentUrl === 'undefined' || currentUrl === '') {
        currentUrl = document.location.href;
      }

      routerCurrent = RouterCurrent$1(routerOptions.gaPageviews);

      currentUrl = removeSlash$2(currentUrl, 'trail');
      userDefinedRoutes = routes;

      function findActiveRoute() {
        let convert = false;

        if (routerOptions.langConvertTo) {
          routerOptions.lang = routerOptions.langConvertTo;
          convert = true;
        }

        return RouterFinder$1(routes, currentUrl, routerOptions.lang, convert).findActiveRoute()
      }

      /**
       * Redirect current route to another
       * @param destinationUrl
       **/
      function navigateNow(destinationUrl) {
        if (typeof window !== 'undefined') {
          if (destinationUrl === NotFoundPage$1) {
            routerCurrent.setActive({ path: NotFoundPage$1 });
          } else {
            navigateTo(destinationUrl);
          }
        }

        return destinationUrl
      }

      function setActiveRoute() {
        const currentRoute = findActiveRoute();
        if (currentRoute.redirectTo) {
          return navigateNow(currentRoute.redirectTo)
        }

        routerCurrent.setActive(currentRoute);
        activeRoute$1.set(currentRoute);

        return currentRoute
      }

      return Object.freeze({
        setActiveRoute,
        findActiveRoute
      })
    }

    /**
     * Converts a route to its localised version
     * @param pathName
     **/
    function localisedRoute(pathName, language) {
      pathName = removeSlash$2(pathName, 'lead');
      routerOptions.langConvertTo = language;

      return SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).findActiveRoute()
    }

    /**
     * Updates the current active route and updates the browser pathname
     * @param pathName String
     * @param language String
     **/
    function navigateTo(pathName, language = null) {
      pathName = removeSlash$2(pathName, 'lead');

      if (language) {
        routerOptions.langConvertTo = language;
      }
      const activeRoute = SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).setActiveRoute();

      return activeRoute
    }

    /**
     * Returns true if pathName is current active route
     * @param pathName String The path name to check against the current route.
     * @param includePath Boolean if true checks that pathName is included in current route. If false should match it.
     **/
    function routeIsActive(queryPath, includePath = false) {
      return routerCurrent.isActive(queryPath, includePath)
    }

    if (typeof window !== 'undefined') {
      // Avoid full page reload on local routes
      window.addEventListener('click', event => {
        if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
          event.preventDefault();
          // event.stopPropagation()
          navigateTo(event.target.pathname + event.target.search);
        }
      });

      window.onpopstate = function(_event) {
        navigateTo(window.location.pathname + window.location.search);
      };
    }

    var spa_router = { SpaRouter, localisedRoute, navigateTo, routeIsActive };
    var spa_router_1 = spa_router.SpaRouter;
    var spa_router_2 = spa_router.localisedRoute;
    var spa_router_3 = spa_router.navigateTo;
    var spa_router_4 = spa_router.routeIsActive;

    /* node_modules/svelte-router-spa/src/components/route.svelte generated by Svelte v3.4.0 */

    // (10:34) 
    function create_if_block_2(ctx) {
    	var current;

    	var route = new Route({
    		props: {
    		currentRoute: ctx.currentRoute.childRoute,
    		params: ctx.params
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			route.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.currentRoute) route_changes.currentRoute = ctx.currentRoute.childRoute;
    			if (changed.params) route_changes.params = ctx.params;
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			route.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			route.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			route.$destroy(detaching);
    		}
    	};
    }

    // (8:33) 
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.currentRoute.component;

    	function switch_props(ctx) {
    		return {
    			props: {
    			currentRoute: { ...ctx.currentRoute, component: '' },
    			params: ctx.params
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, component: '' };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    // (6:0) {#if currentRoute.layout}
    function create_if_block(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = ctx.currentRoute.layout;

    	function switch_props(ctx) {
    		return {
    			props: {
    			currentRoute: { ...ctx.currentRoute, layout: '' },
    			params: ctx.params
    		},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, layout: '' };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.layout)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.currentRoute.layout) return 0;
    		if (ctx.currentRoute.component) return 1;
    		if (ctx.currentRoute.childRoute) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				if (if_block) {
    					group_outros();
    					on_outro(() => {
    						if_blocks[previous_block_index].d(1);
    						if_blocks[previous_block_index] = null;
    					});
    					if_block.o(1);
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { currentRoute = {}, params = {} } = $$props;

    	$$self.$set = $$props => {
    		if ('currentRoute' in $$props) $$invalidate('currentRoute', currentRoute = $$props.currentRoute);
    		if ('params' in $$props) $$invalidate('params', params = $$props.params);
    	};

    	return { currentRoute, params };
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["currentRoute", "params"]);
    	}

    	get currentRoute() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var route$1 = /*#__PURE__*/Object.freeze({
        'default': Route
    });

    /* node_modules/svelte-router-spa/src/components/router.svelte generated by Svelte v3.4.0 */

    function create_fragment$1(ctx) {
    	var current;

    	var route = new Route({
    		props: { currentRoute: ctx.$activeRoute },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			route.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.$activeRoute) route_changes.currentRoute = ctx.$activeRoute;
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			route.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			route.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			route.$destroy(detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	validate_store(store_1, 'activeRoute');
    	subscribe($$self, store_1, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

    	

      let { routes = [], options = {} } = $$props;

      onMount(function() {
        spa_router_1(routes, document.location.href, options).setActiveRoute();
      });

    	$$self.$set = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	return { routes, options, $activeRoute };
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["routes", "options"]);
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var router$1 = /*#__PURE__*/Object.freeze({
        'default': Router
    });

    /* node_modules/svelte-router-spa/src/components/navigate.svelte generated by Svelte v3.4.0 */

    const file = "node_modules/svelte-router-spa/src/components/navigate.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			a.href = ctx.to;
    			a.title = ctx.title;
    			a.className = ctx.styles;
    			toggle_class(a, "active", spa_router_4(ctx.to));
    			add_location(a, file, 24, 0, 482);
    			dispose = listen(a, "click", ctx.navigate);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			if (!current || changed.to) {
    				a.href = ctx.to;
    			}

    			if (!current || changed.title) {
    				a.title = ctx.title;
    			}

    			if (!current || changed.styles) {
    				a.className = ctx.styles;
    			}

    			if ((changed.styles || changed.routeIsActive || changed.to)) {
    				toggle_class(a, "active", spa_router_4(ctx.to));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
      let { to = '/', title = '', styles = '', lang = null } = $$props;

      onMount(function() {
        if (lang) {
          const route = spa_router_2(to, lang);
          if (route) {
            $$invalidate('to', to = route.path);
          }
        }
      });

      function navigate(event) {
        event.preventDefault();
        event.stopPropagation();
        spa_router_3(to);
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('styles' in $$props) $$invalidate('styles', styles = $$props.styles);
    		if ('lang' in $$props) $$invalidate('lang', lang = $$props.lang);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return {
    		to,
    		title,
    		styles,
    		lang,
    		navigate,
    		$$slots,
    		$$scope
    	};
    }

    class Navigate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "title", "styles", "lang"]);
    	}

    	get to() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lang() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lang(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var navigate = /*#__PURE__*/Object.freeze({
        'default': Navigate
    });

    var Route$1 = getCjsExportFromNamespace(route$1);

    var Router$1 = getCjsExportFromNamespace(router$1);

    var Navigate$1 = getCjsExportFromNamespace(navigate);

    const { SpaRouter: SpaRouter$1, navigateTo: navigateTo$1, localisedRoute: localisedRoute$1, routeIsActive: routeIsActive$1 } = spa_router;




    var src = {
      SpaRouter: SpaRouter$1,
      localisedRoute: localisedRoute$1,
      navigateTo: navigateTo$1,
      routeIsActive: routeIsActive$1,
      Route: Route$1,
      Router: Router$1,
      Navigate: Navigate$1
    };
    var src_6 = src.Router;

    /* src/components/Loading.svelte generated by Svelte v3.4.0 */

    /* src/pages/Construction.svelte generated by Svelte v3.4.0 */

    const file$1 = "src/pages/Construction.svelte";

    function create_fragment$3(ctx) {
    	var div, span;

    	return {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "UNDER CONSTRUCTION!";
    			span.className = "m-auto";
    			add_location(span, file$1, 5, 4, 190);
    			div.className = "flex m-auto text-center w-56 h-56 main svelte-odxfqo";
    			add_location(div, file$1, 4, 0, 133);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Construction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    const routes =[
        {name:'/',component:Construction},
    ];

    /* src/App.svelte generated by Svelte v3.4.0 */

    function create_fragment$4(ctx) {
    	var current;

    	var router = new src_6({
    		props: { routes: routes },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.routes) router_changes.routes = routes;
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			router.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			router.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			router.$destroy(detaching);
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    const app = new App({
        target: document.body
    });

}());
//# sourceMappingURL=main.js.map
