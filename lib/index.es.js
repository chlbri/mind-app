import { sharedConfig as O, untrack as fe, createRenderEffect as N, createContext as Ee, useContext as me, $PROXY as ve, createSignal as D, createEffect as ae, createComponent as _, Show as L, createMemo as _e, For as ge, onMount as he } from "solid-js";
import { interpret as $e } from "@bemedev/app-solid";
import { typings as E, createMachine as Ce } from "@bemedev/app-ts";
import { createDraggable as De, DragDropProvider as Ae, DragDropSensors as Se, DragOverlay as Ie } from "@thisbeyond/solid-dnd";
function Oe(e, n, t) {
  let o = t.length, r = n.length, l = o, s = 0, i = 0, c = n[r - 1].nextSibling, a = null;
  for (; s < r || i < l; ) {
    if (n[s] === t[i]) {
      s++, i++;
      continue;
    }
    for (; n[r - 1] === t[l - 1]; )
      r--, l--;
    if (r === s) {
      const d = l < o ? i ? t[i - 1].nextSibling : t[l - i] : c;
      for (; i < l; ) e.insertBefore(t[i++], d);
    } else if (l === i)
      for (; s < r; )
        (!a || !a.has(n[s])) && n[s].remove(), s++;
    else if (n[s] === t[l - 1] && t[i] === n[r - 1]) {
      const d = n[--r].nextSibling;
      e.insertBefore(t[i++], n[s++].nextSibling), e.insertBefore(t[--l], d), n[r] = t[l];
    } else {
      if (!a) {
        a = /* @__PURE__ */ new Map();
        let f = i;
        for (; f < l; ) a.set(t[f], f++);
      }
      const d = a.get(n[s]);
      if (d != null)
        if (i < d && d < l) {
          let f = s, u = 1, h;
          for (; ++f < r && f < l && !((h = a.get(n[f])) == null || h !== d + u); )
            u++;
          if (u > d - i) {
            const g = n[s];
            for (; i < d; ) e.insertBefore(t[i++], g);
          } else e.replaceChild(t[i++], n[s++]);
        } else s++;
      else n[s++].remove();
    }
  }
}
const ee = "_$DX_DELEGATE";
function A(e, n, t, o) {
  let r;
  const l = () => {
    const i = o ? document.createElementNS("http://www.w3.org/1998/Math/MathML", "template") : document.createElement("template");
    return i.innerHTML = e, t ? i.content.firstChild.firstChild : o ? i.firstChild : i.content.firstChild;
  }, s = n ? () => fe(() => document.importNode(r || (r = l()), !0)) : () => (r || (r = l())).cloneNode(!0);
  return s.cloneNode = s, s;
}
function F(e, n = window.document) {
  const t = n[ee] || (n[ee] = /* @__PURE__ */ new Set());
  for (let o = 0, r = e.length; o < r; o++) {
    const l = e[o];
    t.has(l) || (t.add(l), n.addEventListener(l, Le));
  }
}
function te(e, n, t) {
  xe(e) || (t == null ? e.removeAttribute(n) : e.setAttribute(n, t));
}
function X(e, n, t = {}) {
  const o = Object.keys(n || {}), r = Object.keys(t);
  let l, s;
  for (l = 0, s = r.length; l < s; l++) {
    const i = r[l];
    !i || i === "undefined" || n[i] || (ne(e, i, !1), delete t[i]);
  }
  for (l = 0, s = o.length; l < s; l++) {
    const i = o[l], c = !!n[i];
    !i || i === "undefined" || t[i] === c || !c || (ne(e, i, !0), t[i] = c);
  }
  return t;
}
function W(e, n, t) {
  t != null ? e.style.setProperty(n, t) : e.style.removeProperty(n);
}
function j(e, n, t) {
  return fe(() => e(n, t));
}
function C(e, n, t, o) {
  if (t !== void 0 && !o && (o = []), typeof n != "function") return z(e, n, o, t);
  N((r) => z(e, n(), r, t), o);
}
function xe(e) {
  return !!O.context && !O.done && (!e || e.isConnected);
}
function ne(e, n, t) {
  const o = n.trim().split(/\s+/);
  for (let r = 0, l = o.length; r < l; r++) e.classList.toggle(o[r], t);
}
function Le(e) {
  if (O.registry && O.events && O.events.find(([c, a]) => a === e))
    return;
  let n = e.target;
  const t = `$$${e.type}`, o = e.target, r = e.currentTarget, l = (c) => Object.defineProperty(e, "target", {
    configurable: !0,
    value: c
  }), s = () => {
    const c = n[t];
    if (c && !n.disabled) {
      const a = n[`${t}Data`];
      if (a !== void 0 ? c.call(n, a, e) : c.call(n, e), e.cancelBubble) return;
    }
    return n.host && typeof n.host != "string" && !n.host._$host && n.contains(e.target) && l(n.host), !0;
  }, i = () => {
    for (; s() && (n = n._$host || n.parentNode || n.host); ) ;
  };
  if (Object.defineProperty(e, "currentTarget", {
    configurable: !0,
    get() {
      return n || document;
    }
  }), O.registry && !O.done && (O.done = _$HY.done = !0), e.composedPath) {
    const c = e.composedPath();
    l(c[0]);
    for (let a = 0; a < c.length - 2 && (n = c[a], !!s()); a++) {
      if (n._$host) {
        n = n._$host, i();
        break;
      }
      if (n.parentNode === r)
        break;
    }
  } else i();
  l(o);
}
function z(e, n, t, o, r) {
  const l = xe(e);
  if (l) {
    !t && (t = [...e.childNodes]);
    let c = [];
    for (let a = 0; a < t.length; a++) {
      const d = t[a];
      d.nodeType === 8 && d.data.slice(0, 2) === "!$" ? d.remove() : c.push(d);
    }
    t = c;
  }
  for (; typeof t == "function"; ) t = t();
  if (n === t) return t;
  const s = typeof n, i = o !== void 0;
  if (e = i && t[0] && t[0].parentNode || e, s === "string" || s === "number") {
    if (l || s === "number" && (n = n.toString(), n === t))
      return t;
    if (i) {
      let c = t[0];
      c && c.nodeType === 3 ? c.data !== n && (c.data = n) : c = document.createTextNode(n), t = P(e, t, o, c);
    } else
      t !== "" && typeof t == "string" ? t = e.firstChild.data = n : t = e.textContent = n;
  } else if (n == null || s === "boolean") {
    if (l) return t;
    t = P(e, t, o);
  } else {
    if (s === "function")
      return N(() => {
        let c = n();
        for (; typeof c == "function"; ) c = c();
        t = z(e, c, t, o);
      }), () => t;
    if (Array.isArray(n)) {
      const c = [], a = t && Array.isArray(t);
      if (K(c, n, t, r))
        return N(() => t = z(e, c, t, o, !0)), () => t;
      if (l) {
        if (!c.length) return t;
        if (o === void 0) return t = [...e.childNodes];
        let d = c[0];
        if (d.parentNode !== e) return t;
        const f = [d];
        for (; (d = d.nextSibling) !== o; ) f.push(d);
        return t = f;
      }
      if (c.length === 0) {
        if (t = P(e, t, o), i) return t;
      } else a ? t.length === 0 ? oe(e, c, o) : Oe(e, t, c) : (t && P(e), oe(e, c));
      t = c;
    } else if (n.nodeType) {
      if (l && n.parentNode) return t = i ? [n] : n;
      if (Array.isArray(t)) {
        if (i) return t = P(e, t, o, n);
        P(e, t, null, n);
      } else t == null || t === "" || !e.firstChild ? e.appendChild(n) : e.replaceChild(n, e.firstChild);
      t = n;
    }
  }
  return t;
}
function K(e, n, t, o) {
  let r = !1;
  for (let l = 0, s = n.length; l < s; l++) {
    let i = n[l], c = t && t[e.length], a;
    if (!(i == null || i === !0 || i === !1)) if ((a = typeof i) == "object" && i.nodeType)
      e.push(i);
    else if (Array.isArray(i))
      r = K(e, i, c) || r;
    else if (a === "function")
      if (o) {
        for (; typeof i == "function"; ) i = i();
        r = K(e, Array.isArray(i) ? i : [i], Array.isArray(c) ? c : [c]) || r;
      } else
        e.push(i), r = !0;
    else {
      const d = String(i);
      c && c.nodeType === 3 && c.data === d ? e.push(c) : e.push(document.createTextNode(d));
    }
  }
  return r;
}
function oe(e, n, t = null) {
  for (let o = 0, r = n.length; o < r; o++) e.insertBefore(n[o], t);
}
function P(e, n, t, o) {
  if (t === void 0) return e.textContent = "";
  const r = o || document.createTextNode("");
  if (n.length) {
    let l = !1;
    for (let s = n.length - 1; s >= 0; s--) {
      const i = n[s];
      if (r !== i) {
        const c = i.parentNode === e;
        !l && !s ? c ? e.replaceChild(r, i) : e.insertBefore(r, t) : c && i.remove();
      } else l = !0;
    }
  } else e.insertBefore(r, t);
  return [r];
}
const Ne = (e, n) => {
  const t = Ee(e(), n);
  return [({ children: l }) => t.Provider({ value: t.defaultValue, children: l }), () => me(t), t];
};
var ie = Object.prototype.hasOwnProperty;
function J(e, n) {
  var t, o;
  if (e === n) return !0;
  if (e && n && (t = e.constructor) === n.constructor) {
    if (t === Date) return e.getTime() === n.getTime();
    if (t === RegExp) return e.toString() === n.toString();
    if (t === Array) {
      if ((o = e.length) === n.length)
        for (; o-- && J(e[o], n[o]); ) ;
      return o === -1;
    }
    if (!t || typeof e == "object") {
      o = 0;
      for (t in e)
        if (ie.call(e, t) && ++o && !ie.call(n, t) || !(t in n) || !J(e[t], n[t])) return !1;
      return Object.keys(n).length === o;
    }
  }
  return e !== e && n !== n;
}
const ye = Symbol("store-raw"), Te = Symbol("store-node"), k = Symbol("store-has"), Me = Symbol("store-self");
function Q(e) {
  let n;
  return e != null && typeof e == "object" && (e[ve] || !(n = Object.getPrototypeOf(e)) || n === Object.prototype || Array.isArray(e));
}
function Z(e, n = /* @__PURE__ */ new Set()) {
  let t, o, r, l;
  if (t = e != null && e[ye]) return t;
  if (!Q(e) || n.has(e)) return e;
  if (Array.isArray(e)) {
    Object.isFrozen(e) ? e = e.slice(0) : n.add(e);
    for (let s = 0, i = e.length; s < i; s++)
      r = e[s], (o = Z(r, n)) !== r && (e[s] = o);
  } else {
    Object.isFrozen(e) ? e = Object.assign({}, e) : n.add(e);
    const s = Object.keys(e), i = Object.getOwnPropertyDescriptors(e);
    for (let c = 0, a = s.length; c < a; c++)
      l = s[c], !i[l].get && (r = e[l], (o = Z(r, n)) !== r && (e[l] = o));
  }
  return e;
}
function Pe(e, n) {
  let t = e[n];
  return t || Object.defineProperty(e, n, {
    value: t = /* @__PURE__ */ Object.create(null)
  }), t;
}
function re(e, n, t) {
  if (e[n]) return e[n];
  const [o, r] = D(t, {
    equals: !1,
    internal: !0
  });
  return o.$ = r, e[n] = o;
}
function se(e, n, t, o = !1) {
  if (!o && e[n] === t) return;
  const r = e[n], l = e.length;
  t === void 0 ? (delete e[n], e[k] && e[k][n] && r !== void 0 && e[k][n].$()) : (e[n] = t, e[k] && e[k][n] && r === void 0 && e[k][n].$());
  let s = Pe(e, Te), i;
  if ((i = re(s, n, r)) && i.$(() => t), Array.isArray(e) && e.length !== l) {
    for (let c = e.length; c < l; c++) (i = s[c]) && i.$();
    (i = re(s, "length", l)) && i.$(e.length);
  }
  (i = s[Me]) && i.$();
}
const V = /* @__PURE__ */ new WeakMap(), pe = {
  get(e, n) {
    if (n === ye) return e;
    const t = e[n];
    let o;
    return Q(t) ? V.get(t) || (V.set(t, o = new Proxy(t, pe)), o) : t;
  },
  set(e, n, t) {
    return se(e, n, Z(t)), !0;
  },
  deleteProperty(e, n) {
    return se(e, n, void 0, !0), !0;
  }
};
function I(e) {
  return (n) => {
    if (Q(n)) {
      let t;
      (t = V.get(n)) || V.set(n, t = new Proxy(n, pe)), e(t);
    }
    return n;
  };
}
const ke = {
  machine: {
    __tsSchema: void 0
  }
}, T = E.any({
  x: "number",
  y: "number"
});
E.any({
  input: E.maybe(T),
  output: T
});
const be = E.any({
  from: "string",
  to: "string"
}), H = E.any({
  position: T,
  data: E.any({
    label: E.maybe("string"),
    content: "string"
  }),
  input: "boolean"
}), Y = be;
E.any({
  width: "number",
  height: "number",
  id: "string",
  output: T,
  input: E.maybe(T)
});
E.any({
  x0: "number",
  y0: "number",
  x1: "number",
  y1: "number"
});
const je = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let Re = (e = 21) => {
  let n = "", t = crypto.getRandomValues(new Uint8Array(e |= 0));
  for (; e--; )
    n += je[t[e] & 63];
  return n;
};
const q = (e, n) => `edge = ${e} => ${n}`, G = (e) => `node-${e}`, we = Ce(
  {
    __tsSchema: ke.machine.__tsSchema,
    initial: "idle",
    states: {
      idle: {
        on: {
          CONFIGURE: {
            actions: ["configure"],
            target: "/working"
          },
          CONFIGURE_EMPTY: "/working"
        }
      },
      working: {
        on: {
          MOVE: {
            actions: ["moveNode", "buildArrays", "buildUI"]
          },
          MOVE_IMMEDIATE: {
            actions: [
              {
                name: "buildImmediateUI",
                description: "Must be in the ui"
              }
            ]
          },
          ADD_CHILD: {
            actions: [
              "generateID",
              { name: "placeChild", description: "Must be in the ui" },
              "linkChild",
              "buildArrays",
              "buildUI"
            ]
          },
          ADD_SIBLING: {
            actions: [
              "generateID",
              { name: "placeSibling", description: "Must be in the ui" },
              "linkSibling",
              "buildArrays",
              "buildUI"
            ]
          },
          ADD_EDGE: {
            actions: ["addEdge", "buildArrays", "buildUI"]
          },
          DELETE: {
            actions: ["delete", "buildArrays", "buildUI"]
          },
          SELECT: {
            actions: ["select"]
          },
          DESELECT: {
            actions: ["deselect"]
          }
        }
      }
    }
  },
  E({
    eventsMap: {
      CONFIGURE: {
        nodes: E.record(H),
        edges: E.record(Y)
      },
      CONFIGURE_EMPTY: "primitive",
      MOVE: E.intersection(
        {
          id: "string"
        },
        T
      ),
      MOVE_IMMEDIATE: E.intersection(
        {
          id: "string"
        },
        T
      ),
      ADD_CHILD: "string",
      ADD_SIBLING: "string",
      DELETE: "string",
      SELECT: "string",
      DESELECT: "primitive",
      ADD_EDGE: be
    },
    pContext: {
      nodes: E.maybe(
        E.array(E.intersection(H, { id: "string" }))
      ),
      edges: E.maybe(
        E.array(E.intersection(Y, { id: "string" }))
      ),
      generatedId: E.union("string", "null")
    },
    context: E.partial({
      data: {
        nodes: E.record(H),
        edges: E.record(Y)
      },
      selected: "string",
      updatingUI: "boolean"
    })
  })
).provideOptions(({ assign: e, batch: n }) => ({
  actions: {
    configure: n(
      e("context.data", () => ({})),
      e("context.data.nodes", {
        CONFIGURE: ({ payload: { nodes: t } }) => t
      }),
      e("context.data.edges", {
        CONFIGURE: ({ payload: { edges: t } }) => t
      }),
      e("context.updatingUI", () => !1),
      e("pContext.generatedId", () => null)
    ),
    buildArrays: n(
      e("pContext.nodes", ({ context: { data: t } }) => Object.entries({ ...t?.nodes }).map(([o, r]) => ({
        ...r,
        id: o
      }))),
      e("pContext.edges", ({ context: { data: t } }) => Object.entries({ ...t?.edges }).map(([o, r]) => ({
        ...r,
        id: o
      }))),
      e("pContext.generatedId", () => null)
    ),
    generateID: e("pContext.generatedId", () => Re()),
    linkChild: n(
      e("context.data.edges", {
        ADD_CHILD: ({
          context: { data: t },
          payload: o,
          pContext: { generatedId: r }
        }) => {
          const l = { ...t?.edges }, s = G(r), i = q(o, s);
          return l[i] = {
            from: o,
            to: s
          }, l;
        }
      }),
      e(
        "context.selected",
        ({ pContext: { generatedId: t } }) => G(t)
      )
    ),
    linkSibling: n(
      e("context.data.edges", {
        ADD_SIBLING: ({
          context: { data: t },
          payload: o,
          pContext: { edges: r, generatedId: l }
        }) => {
          const s = { ...t?.edges }, i = r?.find(({ to: d }) => d === o)?.from;
          if (!i) return s;
          const c = G(l), a = q(i, c);
          return s[a] = {
            from: i,
            to: c
          }, s;
        }
      }),
      e(
        "context.selected",
        ({ pContext: { generatedId: t } }) => G(t)
      )
    ),
    moveNode: e("context.data.nodes", {
      MOVE: ({ context: { data: t }, payload: { id: o, x: r, y: l } }) => {
        const s = { ...t?.nodes };
        return s[o] = {
          ...s[o],
          position: { x: r, y: l }
        }, s;
      }
    }),
    select: e("context.selected", {
      SELECT: ({ payload: t }) => t
    }),
    delete: n(
      e("context.data.nodes", {
        DELETE: ({ context: { data: t }, payload: o }) => {
          const r = { ...t?.nodes };
          return Object.fromEntries(
            Object.entries(r).filter(([s]) => s !== o)
          );
        }
      }),
      e("context.data.edges", {
        DELETE: ({ context: { data: t }, payload: o }) => {
          const r = { ...t?.edges }, l = Object.entries(r).filter(([i, c]) => !(i === o || c.from === o || c.to === o));
          return Object.fromEntries(l);
        }
      })
    ),
    addEdge: e("context.data.edges", {
      ADD_EDGE: ({ context: { data: t }, payload: { from: o, to: r } }) => {
        const l = { ...t?.edges }, s = q(o, r);
        return l[s] = { from: o, to: r }, l;
      }
    }),
    deselect: e("context", ({ context: { data: t } }) => ({
      data: t
    }))
  }
})), Be = (e = we) => {
  const n = $e(e, {
    pContext: {
      generatedId: null
    }
  });
  return n.start(), n;
}, le = 100, [ot, B] = Ne(
  () => {
    const [e, n] = D(
      {},
      {
        equals: J
      }
    ), t = D(), o = D(), [r, l] = D({}, { equals: !1 }), s = we.provideOptions(
      ({ voidAction: c, batch: a, assign: d }) => ({
        actions: {
          placeChild: d("context.data.nodes", {
            ADD_CHILD: ({
              payload: f,
              context: { data: u },
              pContext: { generatedId: h }
            }) => {
              const g = { ...u?.nodes }, p = g[f], b = `node-${h}`, w = e()[f].width, x = p.position.x + w + le;
              return g[b] = {
                data: { content: "<Nouveau nœud>" },
                input: !0,
                position: { x, y: p.position.y }
              }, g;
            }
          }),
          placeSibling: d("context.data.nodes", {
            ADD_SIBLING: ({
              payload: f,
              context: { data: u },
              pContext: { edges: h, generatedId: g }
            }) => {
              const p = { ...u?.nodes }, b = h?.find(
                (y) => y.to === f
              )?.from;
              if (!b) return p;
              const w = p[b], x = `node-${g}`, m = e()[b].width, $ = w.position.x + m + le;
              return p[x] = {
                data: { content: "<Nouveau nœud>" },
                input: !0,
                position: { x: $, y: w.position.y + 100 }
              }, p;
            }
          }),
          buildUI: a(
            c(({ pContext: { edges: f } }) => {
              l((u) => {
                const h = Object.entries({ ...u }).filter(
                  ([g]) => f?.some((p) => p.id === g)
                );
                return Object.fromEntries(h);
              });
            }),
            c({
              else: ({ pContext: { edges: f } }) => {
                l(
                  I((u) => {
                    f?.forEach(({ from: h, id: g, to: p }) => {
                      const b = e()[h].output, w = e()[p].input, x = o[0]();
                      w && x && (u[g] = {
                        x0: b.x - x.x + 6,
                        y0: b.y - x.y + 6,
                        x1: w.x - x.x + 6,
                        y1: w.y - x.y + 6
                      });
                    });
                  })
                );
              },
              MOVE: ({ pContext: { edges: f }, payload: u }) => {
                l(
                  I((h) => {
                    f?.forEach(({ from: g, to: p, id: b }) => {
                      if (g === u.id) {
                        const w = e()[u.id].width, x = u.x + w + 9, m = u.y + 19.5;
                        h[b] = {
                          ...h[b],
                          x0: x,
                          y0: m
                        }, n(
                          I(($) => {
                            $[u.id] = {
                              ...$[u.id],
                              output: {
                                x,
                                y: m
                              }
                            };
                          })
                        );
                      }
                      if (p === u.id) {
                        const w = u.x - 9, x = u.y + 19.5;
                        h[b] = {
                          ...h[b],
                          x1: w,
                          y1: x
                        }, n(
                          I((m) => {
                            m[u.id] = {
                              ...m[u.id],
                              input: {
                                x: w,
                                y: x
                              }
                            };
                          })
                        );
                      }
                    });
                  })
                );
              }
            }),
            d("context.updatingUI", () => !0)
          ),
          buildImmediateUI: c({
            MOVE_IMMEDIATE: ({ pContext: { edges: f }, payload: u }) => {
              l(
                I((h) => {
                  f?.forEach(({ from: g, to: p, id: b }) => {
                    if (g === u.id) {
                      const w = e()[u.id].width, x = u.x + w + 4, m = u.y + 16.5;
                      h[b] = {
                        ...h[b],
                        x0: x,
                        y0: m
                      }, n(
                        I(($) => {
                          $[u.id] = {
                            ...$[u.id],
                            output: {
                              x,
                              y: m
                            }
                          };
                        })
                      );
                    }
                    if (p === u.id) {
                      const w = u.x - 15, x = u.y + 13.5;
                      h[b] = {
                        ...h[b],
                        x1: w,
                        y1: x
                      }, n(
                        I((m) => {
                          m[u.id] = {
                            ...m[u.id],
                            input: {
                              x: w,
                              y: x
                            }
                          };
                        })
                      );
                    }
                  });
                })
              );
            }
          })
        }
      })
    ), i = Be(s);
    return {
      dimensions: [e, n],
      newEdge: t,
      board: o,
      edgesPositions: [r, l],
      service: i
    };
  },
  { name: "FlowContext" }
);
var Ue = /* @__PURE__ */ A('<svg><path class="fill-transparent cursor-pointer relative"style=pointer-events:all></svg>', !1, !0, !1), Ge = /* @__PURE__ */ A('<svg><g cursor=pointer style=pointer-events:all><circle cx=0 cy=0 r=12 fill="rgba(168, 168, 168, 1)"></circle><svg fill=currentColor stroke-width=0 xmlns=http://www.w3.org/2000/svg class="w-[100px] h-[100px] bg-white fill-white"width=20 height=20 viewBox="0 0 20 20"color=white x=-10 y=-10><path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></svg>', !1, !0, !1);
const ce = (e) => {
  const [n, t] = D({
    x: e.x0 + (e.x1 - e.x0) / 2,
    y: e.y0 + (e.y1 - e.y0) / 2
  }), {
    service: o
  } = B();
  ae(() => {
    const s = e.x0 + (e.x1 - e.x0) / 2, i = e.y0 + (e.y1 - e.y0) / 2;
    t({
      x: s,
      y: i
    });
  });
  const r = o.context((s) => s.selected === e.id);
  function l(s) {
    return s * 100 / 200;
  }
  return [(() => {
    var s = Ue();
    return s.$$click = (i) => {
      i.stopPropagation(), o.send({
        type: "SELECT",
        payload: e.id
      });
    }, N((i) => {
      var c = {
        "stroke-[rgba(168,168,168,0.4)] stroke-3": !!e.isNew,
        "stroke-[rgba(168,168,168,1)] stroke-4 z-100": r() && !e.isNew,
        "stroke-[rgba(168,168,168,0.8)] stroke-3": !r() && !e.isNew
      }, a = `M ${e.x0} ${e.y0} C ${e.x0 + l(Math.abs(e.x1 - e.x0))} ${e.y0}, ${e.x1 - l(Math.abs(e.x1 - e.x0))} ${e.y1}, ${e.x1} ${e.y1}`;
      return i.e = X(s, c, i.e), a !== i.t && te(s, "d", i.t = a), i;
    }, {
      e: void 0,
      t: void 0
    }), s;
  })(), _(L, {
    get when() {
      return r();
    },
    get children() {
      var s = Ge();
      return s.$$click = (i) => {
        i.stopPropagation(), o.send({
          type: "DELETE",
          payload: e.id
        });
      }, N(() => te(s, "transform", `translate(${n().x}, ${n().y})`)), s;
    }
  })];
};
F(["click"]);
var ze = /* @__PURE__ */ A('<svg class="pointer-events-none absolute top-0 w-full h-full">');
const Ve = () => {
  const [e, n] = D(), {
    newEdge: [t],
    edgesPositions: [o]
  } = B(), r = _e(() => Object.entries(o()).map(([s, i]) => ({
    id: s,
    ...i
  })));
  return ae(() => {
    e() && t() && n();
  }), (() => {
    var l = ze();
    return C(l, _(L, {
      get when() {
        return t();
      },
      children: (s) => _(ce, {
        id: "__#new-edge#__TEMP",
        isNew: !0,
        get x0() {
          return s().x0;
        },
        get y0() {
          return s().y0;
        },
        get x1() {
          return s().x1;
        },
        get y1() {
          return s().y1;
        }
      })
    }), null), C(l, _(ge, {
      get each() {
        return r();
      },
      children: ce
    }), null), l;
  })();
};
var de = Object.prototype.hasOwnProperty;
function ue(e, n, t) {
  for (t of e.keys())
    if (R(t, n)) return t;
}
function R(e, n) {
  var t, o, r;
  if (e === n) return !0;
  if (e && n && (t = e.constructor) === n.constructor) {
    if (t === Date) return e.getTime() === n.getTime();
    if (t === RegExp) return e.toString() === n.toString();
    if (t === Array) {
      if ((o = e.length) === n.length)
        for (; o-- && R(e[o], n[o]); ) ;
      return o === -1;
    }
    if (t === Set) {
      if (e.size !== n.size)
        return !1;
      for (o of e)
        if (r = o, r && typeof r == "object" && (r = ue(n, r), !r) || !n.has(r)) return !1;
      return !0;
    }
    if (t === Map) {
      if (e.size !== n.size)
        return !1;
      for (o of e)
        if (r = o[0], r && typeof r == "object" && (r = ue(n, r), !r) || !R(o[1], n.get(r)))
          return !1;
      return !0;
    }
    if (t === ArrayBuffer)
      e = new Uint8Array(e), n = new Uint8Array(n);
    else if (t === DataView) {
      if ((o = e.byteLength) === n.byteLength)
        for (; o-- && e.getInt8(o) === n.getInt8(o); ) ;
      return o === -1;
    }
    if (ArrayBuffer.isView(e)) {
      if ((o = e.byteLength) === n.byteLength)
        for (; o-- && e[o] === n[o]; ) ;
      return o === -1;
    }
    if (!t || typeof e == "object") {
      o = 0;
      for (t in e)
        if (de.call(e, t) && ++o && !de.call(n, t) || !(t in n) || !R(e[t], n[t])) return !1;
      return Object.keys(n).length === o;
    }
  }
  return e !== e && n !== n;
}
var Fe = /* @__PURE__ */ A('<svg class="size-6 bg-green-500 rounded-full p-0.5 hover:bg-green-600 font-bold text-center cursor-pointer overflow-visible"viewBox="0 0 1024 1024"preserveAspectRatio=xMaxYMax xmlns=http://www.w3.org/2000/svg fill=white style=pointer-events:all;fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2><g id=Arrière-plan><path d="M467.40667,277.66696c-0.05948,-14.53055 5.75527,-22.95613 -8.62044,-20.90487c-112.55699,16.0607 -222.1609,112.14558 -245.06161,239.85765c-46.52056,259.43466 231.33083,443.06705 449.51209,316.97506c117.31668,-67.80002 160.95215,-190.43324 151.34416,-288.29849c-5.92276,-60.32819 -27.80273,-107.95668 -53.44246,-144.25469l59.39269,-42.05363c111.72214,156.309 73.11535,351.55635 -25.06953,459.45565c-184.18877,202.4124 -470.46624,145.52064 -592.95027,-32.92123c-156.18269,-227.53604 -27.15324,-543.64371 261.18883,-582.44416c5.0579,-0.68061 3.56556,-7.04079 3.56442,-8.58985c-0.05594,-76.3354 -0.11021,-76.7687 1.10909,-77.24589c2.06886,-0.80969 151.41433,118.4561 151.92482,118.95524c4.65592,4.55233 -0.99548,7.829 -29.07828,30.50907c-120.49369,97.31245 -120.4977,98.55675 -123.0691,97.87586c-0.43639,-0.11555 -0.80698,-0.31322 -0.74442,-66.91571Z"></path><path d="M316.61562,611.03414c0.11517,-90.16257 -0.25516,-99.92912 0.64739,-101.78856c1.56486,-3.22393 131.99102,0.91032 134.6959,-1.89763c2.21336,-2.2977 -0.59362,-129.97807 1.1376,-132.37034c0.7253,-1.00225 11.10552,-0.99175 12.07474,-0.99077c104.50336,0.10564 104.90098,-0.37811 105.967,0.85765c1.56461,1.81373 0.25596,114.18436 0.67852,129.81412c0.1322,4.88975 3.22386,3.28152 99.72028,3.4563c33.0841,0.05992 36.14259,-1.40368 36.21852,4.50462c0.11713,9.11348 1.41954,110.45369 -0.40274,113.92715c-1.81106,3.45208 -130.39967,-0.42618 -134.48289,1.62075c-2.29035,1.14816 -0.36989,101.12392 -1.11542,130.51904c-0.09548,3.76459 -2.13506,3.20617 -47.84854,3.17365c-69.30253,-0.0493 -69.31099,-0.25627 -69.65762,-0.42191c-3.77927,-1.80595 0.16287,-129.33555 -2.24266,-132.58994c-1.79931,-2.43424 -124.06108,-0.29118 -132.80252,-0.97392c-3.81102,-0.29766 -2.58229,-14.8847 -2.58758,-16.8402Z">'), He = /* @__PURE__ */ A('<div class="pointer-events-none cursor-default z-[-3] absolute top-0 -left-[18px] flex flex-col"><div class="cursor-default bg-[#e38b29] w-3 h-3 rounded-full my-3 shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)]"style=pointer-events:all>'), Ye = /* @__PURE__ */ A('<div class="flex flex-col absolute cursor-grab bg-white rounded-md shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)] select-none transition-[border,box-shadow] duration-200 ease-in-out hover:shadow-[2px_2px_12px_-6px_rgba(0,0,0,0.75)] draggable"><div class="pointer-events-none absolute flex items-center justify-end -top-[30px] right-0 transition-all duration-200 ease-in-out space-x-2"><svg class="w-6 h-6 fill-[#a11111] rounded-full cursor-pointer opacity-100 transition-all duration-200 ease-in-out"fill=currentColor stroke-width=2 viewBox="4 4 16 16"style=overflow:visible;pointer-events:all><path d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z"></path></svg><svg class="size-6 bg-blue-500 text-white p-0.5 rounded-lg hover:bg-blue-600 font-bold text-center flex items-center justify-center cursor-pointer"viewBox="0 0 24 24"stroke=currentColor stroke-width=2 style=pointer-events:all><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg></div><div id=outputs class="pointer-events-none z-[-3] absolute top-0 -right-[18px] flex flex-col"><div class="cursor-crosshair bg-[#e38b29] w-3 h-3 rounded-full mt-3 shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)]"style=pointer-events:all>'), qe = /* @__PURE__ */ A('<span class="p-3 border-b border-[#f0f0f0] select-none">'), Xe = /* @__PURE__ */ A('<div class="p-3 select-none">');
const We = (e) => {
  let n, t;
  const [o, r] = D(), {
    dimensions: [l, s],
    newEdge: [i, c],
    board: [a],
    service: d
  } = B(), f = d.context((g) => g.selected === e.id);
  he(() => {
    const g = n, p = t, b = o();
    if (!p || !b) return;
    const w = g?.getBoundingClientRect(), x = p.getBoundingClientRect(), m = b.getBoundingClientRect(), $ = w ? {
      x: w.x,
      y: w.y
    } : void 0, y = {
      x: x.x,
      y: x.y
    };
    s(I((v) => {
      v[e.id] = {
        width: m.width,
        height: m.height,
        output: y,
        input: $
      };
    }));
  });
  const u = d.context((g) => {
    const p = g.data?.edges;
    return p ? Object.values(p).some((b) => b.to === e.id) : !1;
  }), h = De(e.id);
  return (() => {
    var g = Ye(), p = g.firstChild, b = p.firstChild, w = b.nextSibling, x = p.nextSibling, m = x.firstChild;
    j(h, g, () => !0), g.$$mousedown = (y) => {
      y.stopPropagation(), d.send({
        type: "SELECT",
        payload: e.id
      });
    }, j(r, g), b.$$click = (y) => {
      y.stopPropagation(), d.send({
        type: "DELETE",
        payload: e.id
      });
    }, C(p, _(L, {
      get when() {
        return u();
      },
      get children() {
        var y = Fe();
        return y.$$click = () => d.send({
          type: "ADD_SIBLING",
          payload: e.id
        }), y;
      }
    }), w), w.$$click = () => d.send({
      type: "ADD_CHILD",
      payload: e.id
    }), C(g, _(L, {
      get when() {
        return e.label;
      },
      keyed: !0,
      children: (y) => (() => {
        var v = qe();
        return C(v, y), v;
      })()
    }), x), C(g, _(L, {
      get when() {
        return e.content;
      },
      keyed: !0,
      children: (y) => (() => {
        var v = Xe();
        return C(v, y), v;
      })()
    }), x), C(g, _(L, {
      get when() {
        return e.input;
      },
      get children() {
        var y = He(), v = y.firstChild;
        v.$$mouseup = (M) => {
          M.stopPropagation();
          const U = i()?.from;
          U && d.send({
            type: "ADD_EDGE",
            payload: {
              from: U,
              to: e.id
            }
          }), c();
        }, v.$$mousedown = (M) => {
          M.stopPropagation();
        };
        var S = n;
        return typeof S == "function" ? j(S, v) : n = v, y;
      }
    }), x), m.$$mousedown = (y) => {
      y.stopPropagation(), d.send("DESELECT");
      const v = a(), S = l()[e.id].output;
      v && c({
        x0: S.x - v.x + 6,
        y0: S.y - v.y + 6,
        x1: y.x - v.x,
        y1: y.y - v.y,
        from: e.id
      });
    };
    var $ = t;
    return typeof $ == "function" ? j($, m) : t = m, N((y) => {
      var v = {
        "border border-[#e38c29] z-[100]": f(),
        "border border-[#e6d4be] z-[1]": !f()
      }, S = e.y + "px", M = e.x + "px", U = {
        "w-full opacity-100": f(),
        "w-0 -right-3 opacity-0 overflow-hidden": !f()
      };
      return y.e = X(g, v, y.e), S !== y.t && W(g, "top", y.t = S), M !== y.a && W(g, "left", y.a = M), y.o = X(p, U, y.o), y;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), g;
  })();
};
F(["mousedown", "click", "mouseup"]);
var Ke = /* @__PURE__ */ A('<div class="w-full h-full relative">');
const Je = () => {
  const [e, n] = D(), {
    board: [, t],
    service: o
  } = B(), r = (d) => o.context((f) => f.selected)() === d, l = o.context((d) => {
    const f = {
      ...d.data?.nodes
    };
    return Object.entries(f).map(([g, {
      data: {
        content: p,
        label: b
      },
      input: w,
      position: {
        x,
        y: m
      }
    }]) => ({
      id: g,
      x,
      y: m,
      label: b,
      content: p,
      input: w
    }));
  }, R);
  he(() => {
    const d = e();
    if (!d) return;
    const f = d.getBoundingClientRect();
    t({
      x: f.x,
      y: f.y
    });
  });
  const [s, i] = D({
    x: 0,
    y: 0
  }), [c, a] = D("");
  return _(Ae, {
    onDragMove: ({
      draggable: {
        transform: d,
        node: f,
        id: u
      }
    }) => {
      if (a(u), r(u)) {
        i({
          ...d
        });
        const h = f.offsetLeft + s().x + 6, g = f.offsetTop + s().y + 6;
        o.send({
          type: "MOVE_IMMEDIATE",
          payload: {
            id: `${u}`,
            x: h,
            y: g
          }
        });
      }
    },
    onDragEnd: ({
      draggable: {
        node: d,
        id: f
      }
    }) => {
      if (!r(f)) return;
      const u = d.offsetLeft + s().x + 6, h = d.offsetTop + s().y + 6;
      d.style.setProperty("top", h + "px"), d.style.setProperty("left", u + "px"), o.send({
        type: "MOVE",
        payload: {
          id: `${f}`,
          x: u - 6,
          y: h - 6
        }
      });
    },
    get children() {
      return [_(Se, {}), (() => {
        var d = Ke();
        return d.$$mousedown = () => {
          o.send("DESELECT");
        }, j(n, d), C(d, _(ge, {
          get each() {
            return l();
          },
          children: We
        })), d;
      })(), _(L, {
        get when() {
          return !c() || !r(c());
        },
        get children() {
          return _(Ie, {
            children: ""
          });
        }
      })];
    }
  });
};
F(["mousedown"]);
var Ze = /* @__PURE__ */ A('<div class="relative w-full h-full overflow-hidden"><div class="w-full h-full overflow-scroll"><div class="relative h-[150vh] w-[2160px] bg-white bg-size-[30px_30px]"style="background-image:radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px)">');
const it = (e) => {
  const n = {
    "node-0": {
      data: {
        content: "Some text",
        label: "Root node"
      },
      input: !1,
      position: {
        x: 350,
        y: 100
      }
    }
  }, t = e.config?.nodes ?? n, o = {
    ...e.config?.edges
  }, {
    service: r,
    newEdge: [l, s],
    board: [i]
  } = B();
  return r.send({
    type: "CONFIGURE",
    payload: {
      nodes: t,
      edges: o
    }
  }), (() => {
    var c = Ze(), a = c.firstChild, d = a.firstChild;
    return c.$$mousemove = ({
      x: f,
      y: u
    }) => {
      const h = l(), g = i();
      h && g && s({
        ...h,
        x1: f - g.x,
        y1: u - g.y
      });
    }, c.$$mouseup = () => {
      s();
    }, C(d, _(Je, {}), null), C(d, _(Ve, {}), null), N((f) => W(d, "cursor", l() ? "inherit" : "crosshair")), c;
  })();
};
F(["mouseup", "mousemove"]);
const rt = [
  "fill-transparent",
  "cursor-pointer",
  "relative",
  "stroke-[rgba(168,168,168,0.4)]",
  "stroke-3",
  "stroke-[rgba(168,168,168,1)]",
  "stroke-4",
  "z-100",
  "stroke-[rgba(168,168,168,0.8)]",
  "pointer-events-all",
  "w-[100px]",
  "h-[100px]",
  "bg-white",
  "fill-white",
  "pointer-events-none",
  "absolute",
  "top-0",
  "w-full",
  "h-full",
  "overflow-hidden",
  "overflow-scroll",
  "h-[150vh]",
  "w-[2160px]",
  "bg-size-[30px_30px]",
  "flex",
  "flex-col",
  "cursor-grab",
  "rounded-md",
  "shadow-[1px_1px_11px_-6px_rgba(0,0,0,0.75)]",
  "select-none",
  "transition-[border,box-shadow]",
  "duration-200",
  "ease-in-out",
  "hover:shadow-[2px_2px_12px_-6px_rgba(0,0,0,0.75)]",
  "draggable",
  "border",
  "border-[#e38c29]",
  "z-[100]",
  "border-[#e6d4be]",
  "z-[1]",
  "items-center",
  "justify-end",
  "-top-[30px]",
  "right-0",
  "transition-all",
  "space-x-2",
  "opacity-100",
  "w-0",
  "-right-3",
  "opacity-0",
  "w-6",
  "h-6",
  "fill-[#a11111]",
  "rounded-full",
  "size-6",
  "bg-green-500",
  "p-0.5",
  "hover:bg-green-600",
  "font-bold",
  "text-center",
  "overflow-visible",
  "bg-blue-500",
  "text-white",
  "rounded-lg",
  "hover:bg-blue-600",
  "justify-center",
  "p-3",
  "border-b",
  "border-[#f0f0f0]",
  "cursor-default",
  "z-[-3]",
  "-left-[18px]",
  "bg-[#e38b29]",
  "w-3",
  "h-3",
  "my-3",
  "-right-[18px]",
  "cursor-crosshair",
  "mt-3"
];
export {
  rt as CLASSES,
  it as FlowChart,
  ot as Provider,
  B as useFlow
};
