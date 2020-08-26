!function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(e,n,o){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}(n,o))}function u(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function a(t){t.parentNode.removeChild(t)}function l(t){return document.createElement(t)}function f(){return t=" ",document.createTextNode(t);var t}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function p(t,e,n){t.classList[n?"add":"remove"](e)}let h;function v(t){h=t}function b(t){(function(){if(!h)throw new Error("Function called outside component initialization");return h})().$$.on_mount.push(t)}const g=[],m=[],$=[],x=[],y=Promise.resolve();let w=!1;function _(t){$.push(t)}let k=!1;const O=new Set;function M(){if(!k){k=!0;do{for(let t=0;t<g.length;t+=1){const e=g[t];v(e),E(e.$$)}for(g.length=0;m.length;)m.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];O.has(e)||(O.add(e),e())}$.length=0}while(g.length);for(;x.length;)x.pop()();w=!1,k=!1,O.clear()}}function E(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(_)}}const T=new Set;let L;function j(t,e){t&&t.i&&(T.delete(t),t.i(e))}function A(t,e,n,o){if(t&&t.o){if(T.has(t))return;T.add(t),L.c.push(()=>{T.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}function H(t){t&&t.c()}function q(t,n,i){const{fragment:s,on_mount:u,on_destroy:c,after_update:a}=t.$$;s&&s.m(n,i),_(()=>{const n=u.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]}),a.forEach(_)}function P(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function C(t,e){-1===t.$$.dirty[0]&&(g.push(t),w||(w=!0,y.then(M)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function W(e,r,i,s,u,c,l=[-1]){const f=h;v(e);const d=r.props||{},p=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:n(),dirty:l,skip_bound:!1};let b=!1;if(p.ctx=i?i(e,d,(t,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&u(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),b&&C(e,t)),n}):[],p.update(),b=!0,o(p.before_update),p.fragment=!!s&&s(p.ctx),r.target){if(r.hydrate){const t=(g=r.target,Array.from(g.childNodes));p.fragment&&p.fragment.l(t),t.forEach(a)}else p.fragment&&p.fragment.c();r.intro&&j(e.$$.fragment),q(e,r.target,r.anchor),M()}var g;v(f)}class N{$destroy(){P(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var z,I,S=(function(t,e){t.exports=function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={exports:{},id:o,loaded:!1};return t[o].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){var o=n(2),r=function(t){return t&&t.__esModule?t:{default:t}}(o);t.exports=r.default},function(t,e){t.exports=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}},function(t,e,n){function o(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=n(9),i=o(r),s=n(3),u=o(s),c=n(4);e.default=function(){if("undefined"!=typeof window){var t={history:[]},e={offset:{},threshold:0,test:c.inViewport},n=(0,i.default)(function(){t.history.forEach(function(e){t[e].check()})},100);["scroll","resize","load"].forEach(function(t){return addEventListener(t,n)}),window.MutationObserver&&addEventListener("DOMContentLoaded",function(){new MutationObserver(n).observe(document.body,{attributes:!0,childList:!0,subtree:!0})});var o=function(n){if("string"==typeof n){var o=[].slice.call(document.querySelectorAll(n));return t.history.indexOf(n)>-1?t[n].elements=o:(t[n]=(0,u.default)(o,e),t.history.push(n)),t[n]}};return o.offset=function(t){if(void 0===t)return e.offset;var n=function(t){return"number"==typeof t};return["top","right","bottom","left"].forEach(n(t)?function(n){return e.offset[n]=t}:function(o){return n(t[o])?e.offset[o]=t[o]:null}),e.offset},o.threshold=function(t){return"number"==typeof t&&t>=0&&t<=1?e.threshold=t:e.threshold},o.test=function(t){return"function"==typeof t?e.test=t:e.test},o.is=function(t){return e.test(t,e)},o.offset(0),o}}()},function(t,e){Object.defineProperty(e,"__esModule",{value:!0});var n=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),o=function(){function t(e,n){(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")})(this,t),this.options=n,this.elements=e,this.current=[],this.handlers={enter:[],exit:[]},this.singles={enter:[],exit:[]}}return n(t,[{key:"check",value:function(){var t=this;return this.elements.forEach(function(e){var n=t.options.test(e,t.options),o=t.current.indexOf(e),r=o>-1,i=n&&!r,s=!n&&r;i&&(t.current.push(e),t.emit("enter",e)),s&&(t.current.splice(o,1),t.emit("exit",e))}),this}},{key:"on",value:function(t,e){return this.handlers[t].push(e),this}},{key:"once",value:function(t,e){return this.singles[t].unshift(e),this}},{key:"emit",value:function(t,e){for(;this.singles[t].length;)this.singles[t].pop()(e);for(var n=this.handlers[t].length;--n>-1;)this.handlers[t][n](e);return this}}]),t}();e.default=function(t,e){return new o(t,e)}},function(t,e){Object.defineProperty(e,"__esModule",{value:!0}),e.inViewport=function(t,e){var n=t.getBoundingClientRect(),o=n.top,r=n.right,i=n.bottom,s=n.left,u=n.width,c=n.height,a={t:i,r:window.innerWidth-s,b:window.innerHeight-o,l:r},l={x:e.threshold*u,y:e.threshold*c};return a.t>e.offset.top+l.y&&a.r>e.offset.right+l.x&&a.b>e.offset.bottom+l.y&&a.l>e.offset.left+l.x}},function(t,e){(function(e){var n="object"==typeof e&&e&&e.Object===Object&&e;t.exports=n}).call(e,function(){return this}())},function(t,e,n){var o=n(5),r="object"==typeof self&&self&&self.Object===Object&&self,i=o||r||Function("return this")();t.exports=i},function(t,e,n){var o=n(1),r=n(8),i=n(10),s="Expected a function",u=Math.max,c=Math.min;t.exports=function(t,e,n){function a(e){var n=h,o=v;return h=v=void 0,x=e,g=t.apply(o,n)}function l(t){var n=t-$,o=t-x;return void 0===$||n>=e||n<0||w&&o>=b}function f(){var t=r();return l(t)?d(t):void(m=setTimeout(f,function(t){var n=t-x,o=e-(t-$);return w?c(o,b-n):o}(t)))}function d(t){return m=void 0,_&&h?a(t):(h=v=void 0,g)}function p(){var t=r(),n=l(t);if(h=arguments,v=this,$=t,n){if(void 0===m)return function(t){return x=t,m=setTimeout(f,e),y?a(t):g}($);if(w)return m=setTimeout(f,e),a($)}return void 0===m&&(m=setTimeout(f,e)),g}var h,v,b,g,m,$,x=0,y=!1,w=!1,_=!0;if("function"!=typeof t)throw new TypeError(s);return e=i(e)||0,o(n)&&(y=!!n.leading,b=(w="maxWait"in n)?u(i(n.maxWait)||0,e):b,_="trailing"in n?!!n.trailing:_),p.cancel=function(){void 0!==m&&clearTimeout(m),x=0,h=$=v=m=void 0},p.flush=function(){return void 0===m?g:d(r())},p}},function(t,e,n){var o=n(6);t.exports=function(){return o.Date.now()}},function(t,e,n){var o=n(7),r=n(1),i="Expected a function";t.exports=function(t,e,n){var s=!0,u=!0;if("function"!=typeof t)throw new TypeError(i);return r(n)&&(s="leading"in n?!!n.leading:s,u="trailing"in n?!!n.trailing:u),o(t,e,{leading:s,maxWait:e,trailing:u})}},function(t,e){t.exports=function(t){return t}}])}(z={exports:{}},z.exports),z.exports),U=(I=S)&&I.__esModule&&Object.prototype.hasOwnProperty.call(I,"default")?I.default:I;S.inView;const R=[];let V=function(e,n=t){let o;const r=[];function s(t){if(i(e,t)&&(e=t,o)){const t=!R.length;for(let t=0;t<r.length;t+=1){const n=r[t];n[1](),R.push(n,e)}if(t){for(let t=0;t<R.length;t+=2)R[t][0](R[t+1]);R.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(i,u=t){const c=[i,u];return r.push(c),1===r.length&&(o=n(s)||t),i(e),()=>{const t=r.indexOf(c);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}({"#top":!0,"#about":!1,"#work":!1,"#contact":!1});function Y(e){let n;return{c(){(n=l("div")).innerHTML='<div class="m-auto text-center text-white w-7/12"><h1 class="font-bold text-4xl">John Abraham</h1> \n        <p>A Python developer who loves to solve problems. (Not the indian actor!)</p></div>',d(n,"id","top"),d(n,"class","flex w-screen bg-blue-300 h-screen")},m(t,e){c(t,n,e)},p:t,i:t,o:t,d(t){t&&a(n)}}}function B(t){return b(async()=>{U("#top h1").on("enter",()=>{V.update(t=>(t["#top"]=!0,t))}).on("exit",()=>{V.update(t=>(t["#top"]=!1,t))})}),[]}class D extends N{constructor(t){super(),W(this,t,B,Y,i,{})}}function F(e){let n;return{c(){(n=l("div")).innerHTML='<h1 class="w-full font-bold text-4xl">About</h1> \n    <p class="w-9/12 m-auto">Lorem ipsum dolor sit amet, consectetur adipisicing elit.\n    Suscipit quis iusto quo reprehenderit. Excepturi cum sit \n    inventore dignissimos aperiam culpa non eos placeat aut \n    animi? Omnis facere optio minima quod. Lorem ipsum dolor \n    sit amet consectetur adipisicing elit. Placeat rem dignissimos\n    expedita amet, quaerat dolor itaque iusto! Ipsa, qui quod \n    porro voluptates facere tempore eveniet doloribus voluptate \n    dolor perspiciatis autem!</p>',d(n,"id","about"),d(n,"class","flex flex-col\n    w-11/12 h-screen mx-auto text-center py-24\n    bg-blue-300 text-white rounded-lg\n    hover:shadow-md\n    transition-all duration-500 ease-in-out"),p(n,"bg-blue-400",e[0])},m(t,e){c(t,n,e)},p(t,[e]){1&e&&p(n,"bg-blue-400",t[0])},i:t,o:t,d(t){t&&a(n)}}}function G(t,e,n){let o;s(t,V,t=>n(1,o=t));let r=!1;return b(async()=>{U("#about h1").on("enter",()=>{V.update(t=>(t["#about"]=!0,t))}).on("exit",()=>{V.update(t=>(t["#about"]=!1,t))})}),t.$$.update=(()=>{2&t.$$.dirty&&n(0,r=o["#about"])}),[r]}class J extends N{constructor(t){super(),W(this,t,G,F,i,{})}}function Z(t){return b(async()=>{U("#work").on("enter",()=>{V.update(t=>(t["#work"]=!0,t))}).on("exit",()=>{V.update(t=>(t["#work"]=!1,t))})}),[]}class K extends N{constructor(t){super(),W(this,t,Z,null,i,{})}}class Q extends N{constructor(t){super(),W(this,t,null,null,i,{})}}function X(e){let n,o,r,i,s,u,l,d;return n=new D({}),r=new J({}),s=new K({}),l=new Q({}),{c(){H(n.$$.fragment),o=f(),H(r.$$.fragment),i=f(),H(s.$$.fragment),u=f(),H(l.$$.fragment)},m(t,e){q(n,t,e),c(t,o,e),q(r,t,e),c(t,i,e),q(s,t,e),c(t,u,e),q(l,t,e),d=!0},p:t,i(t){d||(j(n.$$.fragment,t),j(r.$$.fragment,t),j(s.$$.fragment,t),j(l.$$.fragment,t),d=!0)},o(t){A(n.$$.fragment,t),A(r.$$.fragment,t),A(s.$$.fragment,t),A(l.$$.fragment,t),d=!1},d(t){P(n,t),t&&a(o),P(r,t),t&&a(i),P(s,t),t&&a(u),P(l,t)}}}function tt(t){return document.body.classList.add("bg-blue-300"),[]}class et extends N{constructor(t){super(),W(this,t,tt,X,i,{})}}function nt(e){let n,o,r;return{c(){(n=l("button")).innerHTML='<span class="hamburger-box svelte-eidryd"><span class="hamburger-inner svelte-eidryd"></span></span>',d(n,"class","w-full hamburger focus:outline-none hamburger--emphatic svelte-eidryd"),d(n,"type","button"),p(n,"is-active",e[0])},m(t,i){var s,u,a,l;c(t,n,i),o||(s=n,u="click",a=e[1],s.addEventListener(u,a,l),r=(()=>s.removeEventListener(u,a,l)),o=!0)},p(t,[e]){1&e&&p(n,"is-active",t[0])},i:t,o:t,d(t){t&&a(n),o=!1,r()}}}function ot(t,e,n){let{active:o=!1}=e;return t.$$set=(t=>{"active"in t&&n(0,o=t.active)}),[o,t=>n(0,o=!o)]}class rt extends N{constructor(t){super(),W(this,t,ot,nt,i,{active:0})}}function it(t){let e,n,o,r,i,s,h,v,b,g,$,y,w,_,k,O,M,E,T,L,C;function W(e){t[2].call(null,e)}let N={};return void 0!==t[0]&&(N.active=t[0]),i=new rt({props:N}),m.push(()=>(function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))})(i,"active",W)),{c(){(e=l("div")).textContent="Used to make sure conditional css styles are not purged",n=f(),o=l("div"),r=l("div"),H(i.$$.fragment),h=f(),v=l("div"),b=l("div"),g=f(),$=l("ol"),(y=l("li")).innerHTML='<a href="#top" class="svelte-7b9voi">Home</a>',w=f(),(_=l("li")).innerHTML='<a href="#about" class="svelte-7b9voi">About</a>',k=f(),(O=l("li")).innerHTML='<a href="#work" class="svelte-7b9voi">Works</a>',M=f(),(E=l("li")).innerHTML='<a href="#contact" class="svelte-7b9voi">contact</a>',T=f(),(L=l("li")).innerHTML='<a href="https://docs.google.com/document/d/1ZRp1OYUPWxxOMaYpG4tjT4UsIAhNLra4AzoIYUm18lI/export?format=pdf" class="svelte-7b9voi">Resume</a>',d(e,"class","hidden w-0 w-drawer svelte-7b9voi"),d(r,"class","flex m-auto"),d(o,"class","flex fixed right-0 top-0 pr-1 lg:hidden z-10"),d(b,"class","h-12 w-full"),d(y,"class","nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi"),p(y,"active",t[1]["#top"]),d(_,"class","nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi"),p(_,"active",t[1]["#about"]),d(O,"class","nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi"),p(O,"active",t[1]["#work"]),d(E,"class","nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi"),p(E,"active",t[1]["#contact"]),d(L,"class","nav-container border-l-4 lg:border-b-4 lg:border-l-0 py-6 lg:px-6 svelte-7b9voi"),d($,"class","lg:flex text-center lg:m-auto"),d(v,"class","\n    fixed lg:flex top-0 right-0 lg:h-auto lg:w-screen \n    bg-white shadow-md rounded-b \n    transition-all duration-300 ease-in-out \n    overflow-hidden svelte-7b9voi"),p(v,"w-0",!t[0]),p(v,"w-drawer",t[0])},m(t,s){c(t,e,s),c(t,n,s),c(t,o,s),u(o,r),q(i,r,null),c(t,h,s),c(t,v,s),u(v,b),u(v,g),u(v,$),u($,y),u($,w),u($,_),u($,k),u($,O),u($,M),u($,E),u($,T),u($,L),C=!0},p(t,[e]){const n={};var o;!s&&1&e&&(s=!0,n.active=t[0],o=(()=>s=!1),x.push(o)),i.$set(n),2&e&&p(y,"active",t[1]["#top"]),2&e&&p(_,"active",t[1]["#about"]),2&e&&p(O,"active",t[1]["#work"]),2&e&&p(E,"active",t[1]["#contact"]),1&e&&p(v,"w-0",!t[0]),1&e&&p(v,"w-drawer",t[0])},i(t){C||(j(i.$$.fragment,t),C=!0)},o(t){A(i.$$.fragment,t),C=!1},d(t){t&&a(e),t&&a(n),t&&a(o),P(i),t&&a(h),t&&a(v)}}}function st(t,e,n){let o;s(t,V,t=>n(1,o=t));let r=!1;return[r,o,function(t){n(0,r=t)}]}class ut extends N{constructor(t){super(),W(this,t,st,it,i,{})}}function ct(e){let n,o,r,i;return n=new ut({}),r=new et({}),{c(){H(n.$$.fragment),o=f(),H(r.$$.fragment)},m(t,e){q(n,t,e),c(t,o,e),q(r,t,e),i=!0},p:t,i(t){i||(j(n.$$.fragment,t),j(r.$$.fragment,t),i=!0)},o(t){A(n.$$.fragment,t),A(r.$$.fragment,t),i=!1},d(t){P(n,t),t&&a(o),P(r,t)}}}new class extends N{constructor(t){super(),W(this,t,null,ct,i,{})}}({target:document.body})}();
//# sourceMappingURL=main.js.map
