/* ============================================================
   FTP · DSA Library
   Classic data structures powering site features:
   - Trie          → instant exercise/page search (prefix matching)
   - MinHeap       → priority queue for the to-do list
   - LRUCache      → "recently viewed" tracking across pages
   - UndoStack     → bounded undo history for the to-do list
   ============================================================ */

/** Trie (prefix tree) — O(L) insert/search where L = word length. */
class Trie {
  constructor() {
    this.root = { children: new Map(), items: [] };
  }

  /** Index `payload` under every word of `phrase`. */
  insert(phrase, payload) {
    for (const word of phrase.toLowerCase().split(/\s+/)) {
      let node = this.root;
      for (const ch of word) {
        if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), items: [] });
        node = node.children.get(ch);
        node.items.push(payload);
      }
    }
  }

  /** All payloads whose indexed words start with `prefix` (deduped, capped). */
  search(prefix, limit = 8) {
    let node = this.root;
    for (const ch of prefix.toLowerCase().trim()) {
      node = node.children.get(ch);
      if (!node) return [];
    }
    const seen = new Set();
    const out = [];
    for (const item of node.items) {
      const key = item.id ?? item.title ?? item;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  }
}

/** Binary min-heap — O(log n) push/pop. `compare(a,b) < 0` means a has priority. */
class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.heap = [];
    this.compare = compare;
  }
  get size() { return this.heap.length; }
  peek() { return this.heap[0]; }

  push(value) {
    const h = this.heap;
    h.push(value);
    let i = h.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(h[i], h[parent]) >= 0) break;
      [h[i], h[parent]] = [h[parent], h[i]];
      i = parent;
    }
    return this;
  }

  pop() {
    const h = this.heap;
    if (h.length === 0) return undefined;
    const top = h[0];
    const last = h.pop();
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let smallest = i;
        if (l < h.length && this.compare(h[l], h[smallest]) < 0) smallest = l;
        if (r < h.length && this.compare(h[r], h[smallest]) < 0) smallest = r;
        if (smallest === i) break;
        [h[i], h[smallest]] = [h[smallest], h[i]];
        i = smallest;
      }
    }
    return top;
  }

  /** Drain into a sorted array (heap-sort) without mutating the heap. */
  toSortedArray() {
    const clone = new MinHeap(this.compare);
    clone.heap = [...this.heap];
    const out = [];
    while (clone.size) out.push(clone.pop());
    return out;
  }

  static from(items, compare) {
    const heap = new MinHeap(compare);
    for (const item of items) heap.push(item);
    return heap;
  }
}

/** LRU cache backed by Map insertion order — O(1) get/put. */
class LRUCache {
  constructor(capacity = 6, storageKey = null) {
    this.capacity = capacity;
    this.storageKey = storageKey;
    this.map = new Map();
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        for (const [k, v] of saved) this.map.set(k, v);
      } catch { /* corrupt state — start fresh */ }
    }
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value);
    this.map.set(key, value);
    this.persist();
  }

  /** Most-recent first. */
  entries() { return [...this.map.entries()].reverse(); }

  persist() {
    if (!this.storageKey) return;
    try { localStorage.setItem(this.storageKey, JSON.stringify([...this.map.entries()])); }
    catch { /* storage full/unavailable — cache stays in-memory */ }
  }
}

/** Bounded undo stack. */
class UndoStack {
  constructor(limit = 30) {
    this.limit = limit;
    this.stack = [];
  }
  get size() { return this.stack.length; }
  push(snapshot) {
    this.stack.push(snapshot);
    if (this.stack.length > this.limit) this.stack.shift();
  }
  pop() { return this.stack.pop(); }
}

window.FTPDSA = { Trie, MinHeap, LRUCache, UndoStack };
