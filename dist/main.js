
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Top.svelte generated by Svelte v3.24.1 */

    const file = "src/components/Top.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "John Abraham";
    			t1 = space();
    			p = element("p");
    			p.textContent = "A Python developer who loves to solve problems. (Not the indian actor!)";
    			attr_dev(h1, "class", "font-bold text-4xl");
    			add_location(h1, file, 8, 8, 232);
    			add_location(p, file, 9, 8, 289);
    			attr_dev(div0, "class", "m-auto text-center text-white w-7/12");
    			add_location(div0, file, 7, 4, 173);
    			attr_dev(div1, "id", "top");
    			attr_dev(div1, "class", "flex w-screen bg-blue-300 h-screen");
    			add_location(div1, file, 6, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Top> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Top", $$slots, []);
    	return [];
    }

    class Top extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Top",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/About.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/About.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "About";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit.\n    Suscipit quis iusto quo reprehenderit. Excepturi cum sit \n    inventore dignissimos aperiam culpa non eos placeat aut \n    animi? Omnis facere optio minima quod. Lorem ipsum dolor \n    sit amet consectetur adipisicing elit. Placeat rem dignissimos\n    expedita amet, quaerat dolor itaque iusto! Ipsa, qui quod \n    porro voluptates facere tempore eveniet doloribus voluptate \n    dolor perspiciatis autem!";
    			attr_dev(h1, "class", "w-full font-bold text-4xl");
    			add_location(h1, file$1, 13, 4, 337);
    			attr_dev(p, "class", "w-9/12 m-auto");
    			add_location(p, file$1, 14, 4, 390);
    			attr_dev(div, "id", "about");
    			attr_dev(div, "class", "flex flex-col\n    w-11/12 mx-auto text-center py-24\n    bg-blue-300 text-white rounded-lg\n    hover:bg-blue-400 hover:shadow-md hover:border-blue-400\n    transition-all duration-500 ease-in-out");
    			add_location(div, file$1, 6, 0, 113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Experience.svelte generated by Svelte v3.24.1 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experience> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Experience", $$slots, []);
    	return [];
    }

    class Experience extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experience",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Contact", $$slots, []);
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/Main.svelte generated by Svelte v3.24.1 */

    function create_fragment$4(ctx) {
    	let top;
    	let t0;
    	let about;
    	let t1;
    	let experience;
    	let t2;
    	let contact;
    	let current;
    	top = new Top({ $$inline: true });
    	about = new About({ $$inline: true });
    	experience = new Experience({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(top.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(experience.$$.fragment);
    			t2 = space();
    			create_component(contact.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(top, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(about, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(experience, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(experience.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(experience.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(top, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(experience, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(contact, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	document.body.classList.add("bg-blue-300");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Main", $$slots, []);
    	$$self.$capture_state = () => ({ Top, About, Experience, Contact });
    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/utils/Hamburger.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/components/utils/Hamburger.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let span1;
    	let span0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span1 = element("span");
    			span0 = element("span");
    			attr_dev(span0, "class", "hamburger-inner svelte-10u8132");
    			add_location(span0, file$2, 14, 4, 23159);
    			attr_dev(span1, "class", "hamburger-box svelte-10u8132");
    			add_location(span1, file$2, 13, 2, 23126);
    			attr_dev(button, "class", "w-full hamburger focus:outline-none hamburger--emphatic svelte-10u8132");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "is-active", /*active*/ ctx[0]);
    			add_location(button, file$2, 12, 0, 22981);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span1);
    			append_dev(span1, span0);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1) {
    				toggle_class(button, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { active = false } = $$props;
    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hamburger> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hamburger", $$slots, []);
    	const click_handler = e => $$invalidate(0, active = !active);

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ active });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, click_handler];
    }

    class Hamburger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hamburger",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get active() {
    		throw new Error("<Hamburger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Hamburger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/components/Navbar.svelte";

    function create_fragment$6(ctx) {
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let hamburger;
    	let updating_active;
    	let t2;
    	let div4;
    	let div3;
    	let t3;
    	let ol;
    	let li0;
    	let a0;
    	let t5;
    	let li1;
    	let a1;
    	let t7;
    	let li2;
    	let a2;
    	let t9;
    	let li3;
    	let a3;
    	let t11;
    	let li4;
    	let a4;
    	let current;
    	let mounted;
    	let dispose;

    	function hamburger_active_binding(value) {
    		/*hamburger_active_binding*/ ctx[3].call(null, value);
    	}

    	let hamburger_props = {};

    	if (/*menuOpen*/ ctx[0] !== void 0) {
    		hamburger_props.active = /*menuOpen*/ ctx[0];
    	}

    	hamburger = new Hamburger({ props: hamburger_props, $$inline: true });
    	binding_callbacks.push(() => bind(hamburger, "active", hamburger_active_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Used to make sure conditional css styles are not purged";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(hamburger.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t3 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About";
    			t7 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Experience";
    			t9 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "contact";
    			t11 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Resume";
    			attr_dev(div0, "class", "hidden w-0 w-drawer svelte-7b9voi");
    			add_location(div0, file$3, 13, 0, 902);
    			attr_dev(div1, "class", "flex m-auto");
    			add_location(div1, file$3, 18, 4, 1067);
    			attr_dev(div2, "class", "flex fixed right-0 top-0 pr-1 lg:hidden z-10");
    			add_location(div2, file$3, 17, 0, 1004);
    			attr_dev(div3, "class", "h-12 w-full");
    			add_location(div3, file$3, 30, 4, 1393);
    			attr_dev(a0, "href", "#top");
    			attr_dev(a0, "class", "svelte-7b9voi");
    			add_location(a0, file$3, 34, 12, 1627);
    			attr_dev(li0, "class", "nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi");
    			toggle_class(li0, "active", /*route*/ ctx[1] == "" || /*route*/ ctx[1] == "#top");
    			add_location(li0, file$3, 32, 8, 1480);
    			attr_dev(a1, "href", "#about");
    			attr_dev(a1, "class", "svelte-7b9voi");
    			add_location(a1, file$3, 38, 12, 1807);
    			attr_dev(li1, "class", "nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi");
    			toggle_class(li1, "active", /*route*/ ctx[1] == "#about");
    			add_location(li1, file$3, 36, 8, 1673);
    			attr_dev(a2, "href", "#work");
    			attr_dev(a2, "class", "svelte-7b9voi");
    			add_location(a2, file$3, 42, 12, 1989);
    			attr_dev(li2, "class", "nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi");
    			toggle_class(li2, "active", /*route*/ ctx[1] == "#work");
    			add_location(li2, file$3, 40, 8, 1856);
    			attr_dev(a3, "href", "#contact");
    			attr_dev(a3, "class", "svelte-7b9voi");
    			add_location(a3, file$3, 46, 12, 2178);
    			attr_dev(li3, "class", "nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi");
    			toggle_class(li3, "active", /*route*/ ctx[1] == "#contact");
    			add_location(li3, file$3, 44, 8, 2042);
    			attr_dev(a4, "href", "https://docs.google.com/document/d/1ZRp1OYUPWxxOMaYpG4tjT4UsIAhNLra4AzoIYUm18lI/export?format=pdf");
    			attr_dev(a4, "class", "svelte-7b9voi");
    			add_location(a4, file$3, 50, 12, 2334);
    			attr_dev(li4, "class", "nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi");
    			add_location(li4, file$3, 48, 8, 2231);
    			attr_dev(ol, "class", "lg:flex text-center lg:m-auto");
    			add_location(ol, file$3, 31, 4, 1429);
    			attr_dev(div4, "class", "\n    fixed lg:flex top-0 right-0 lg:h-auto lg:w-screen \n    bg-white shadow-md rounded-b \n    transition-all duration-500 ease-in-out \n    overflow-hidden svelte-7b9voi");
    			toggle_class(div4, "w-0", !/*menuOpen*/ ctx[0]);
    			toggle_class(div4, "w-drawer", /*menuOpen*/ ctx[0]);
    			add_location(div4, file$3, 22, 0, 1159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(hamburger, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div4, t3);
    			append_dev(div4, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a0);
    			append_dev(ol, t5);
    			append_dev(ol, li1);
    			append_dev(li1, a1);
    			append_dev(ol, t7);
    			append_dev(ol, li2);
    			append_dev(li2, a2);
    			append_dev(ol, t9);
    			append_dev(ol, li3);
    			append_dev(li3, a3);
    			append_dev(ol, t11);
    			append_dev(ol, li4);
    			append_dev(li4, a4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "hashchange", /*hashchange*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburger_changes = {};

    			if (!updating_active && dirty & /*menuOpen*/ 1) {
    				updating_active = true;
    				hamburger_changes.active = /*menuOpen*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			hamburger.$set(hamburger_changes);

    			if (dirty & /*route*/ 2) {
    				toggle_class(li0, "active", /*route*/ ctx[1] == "" || /*route*/ ctx[1] == "#top");
    			}

    			if (dirty & /*route*/ 2) {
    				toggle_class(li1, "active", /*route*/ ctx[1] == "#about");
    			}

    			if (dirty & /*route*/ 2) {
    				toggle_class(li2, "active", /*route*/ ctx[1] == "#work");
    			}

    			if (dirty & /*route*/ 2) {
    				toggle_class(li3, "active", /*route*/ ctx[1] == "#contact");
    			}

    			if (dirty & /*menuOpen*/ 1) {
    				toggle_class(div4, "w-0", !/*menuOpen*/ ctx[0]);
    			}

    			if (dirty & /*menuOpen*/ 1) {
    				toggle_class(div4, "w-drawer", /*menuOpen*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburger.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburger.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(hamburger);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let menuOpen = false;
    	let route = document.location.hash;

    	function hashchange(e) {
    		$$invalidate(1, route = document.location.hash);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	function hamburger_active_binding(value) {
    		menuOpen = value;
    		$$invalidate(0, menuOpen);
    	}

    	$$self.$capture_state = () => ({ Hamburger, menuOpen, route, hashchange });

    	$$self.$inject_state = $$props => {
    		if ("menuOpen" in $$props) $$invalidate(0, menuOpen = $$props.menuOpen);
    		if ("route" in $$props) $$invalidate(1, route = $$props.route);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuOpen, route, hashchange, hamburger_active_binding];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    function create_fragment$7(ctx) {
    	let navbar;
    	let t;
    	let main;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Main, Navbar });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

}());
//# sourceMappingURL=main.js.map
