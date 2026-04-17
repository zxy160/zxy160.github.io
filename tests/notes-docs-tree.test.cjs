const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const notesLayout = require('../source/js/notes-layout.js');

test('parseNotesPath recognizes notes article paths', () => {
  assert.deepEqual(notesLayout.parseNotesPath('/notes/demo/article-1/'), {
    isNotesPage: true,
    group: 'demo',
    articlePath: '/notes/demo/article-1/',
    manifestPath: '/notes/demo/manifest.json',
  });
});

test('extractHeadingItems filters to h2 and h3 with stable ids', () => {
  const headings = [
    { tagName: 'H1', id: 'skip', textContent: 'Skip' },
    { tagName: 'H2', id: '', textContent: 'Overview' },
    { tagName: 'H3', id: '', textContent: 'Inclusive Terminology' },
    { tagName: 'H4', id: 'skip-too', textContent: 'Skip Too' },
  ];

  assert.deepEqual(notesLayout.extractHeadingItems(headings), [
    { level: 2, id: 'overview', text: 'Overview' },
    { level: 3, id: 'inclusive-terminology', text: 'Inclusive Terminology' },
  ]);
});

test('extractHeadingItems avoids duplicate ids when one heading already owns the slug', () => {
  const headings = [
    { tagName: 'H2', id: 'overview', textContent: 'Overview' },
    { tagName: 'H3', id: '', textContent: 'Overview' },
  ];

  assert.deepEqual(notesLayout.extractHeadingItems(headings), [
    { level: 2, id: 'overview', text: 'Overview' },
    { level: 3, id: 'overview-2', text: 'Overview' },
  ]);
});

test('buildTreeModel expands only the current article and marks the hash match', () => {
  const manifest = {
    title: 'Demo Notes',
    articles: [
      { title: 'Article 1', path: '/notes/demo/article-1/' },
      { title: 'Article 2', path: '/notes/demo/article-2/' },
    ],
  };

  const headings = [
    { level: 2, id: 'overview', text: 'Overview' },
    { level: 3, id: 'inclusive-terminology', text: 'Inclusive Terminology' },
  ];

  assert.deepEqual(
    notesLayout.buildTreeModel(
      manifest,
      '/notes/demo/article-1/',
      '#inclusive-terminology',
      headings
    ),
    {
      title: 'Demo Notes',
      items: [
        {
          title: 'Article 1',
          path: '/notes/demo/article-1/',
          active: true,
          expanded: true,
          children: [
            {
              title: 'Overview',
              href: '/notes/demo/article-1/#overview',
              active: false,
              level: 2,
            },
            {
              title: 'Inclusive Terminology',
              href: '/notes/demo/article-1/#inclusive-terminology',
              active: true,
              level: 3,
            },
          ],
        },
        {
          title: 'Article 2',
          path: '/notes/demo/article-2/',
          active: false,
          expanded: false,
          children: [],
        },
      ],
    }
  );
});

test('buildPrevNext returns neighbors from manifest order', () => {
  const manifest = {
    title: 'Demo Notes',
    articles: [
      { title: 'Article 1', path: '/notes/demo/article-1/' },
      { title: 'Article 2', path: '/notes/demo/article-2/' },
    ],
  };

  assert.deepEqual(notesLayout.buildPrevNext(manifest, '/notes/demo/article-2/'), {
    prev: { title: 'Article 1', path: '/notes/demo/article-1/' },
    next: null,
  });
});

test('buildPrevNext returns the real demo manifest neighbor order', () => {
  const manifest = require('../source/notes/demo/manifest.json');

  assert.deepEqual(notesLayout.buildPrevNext(manifest, '/notes/demo/article-1/'), {
    prev: null,
    next: { title: 'Demo Article 2: Hash', path: '/notes/demo/article-2/' },
  });
});

test('init mounts notes state and refreshes the active child on hashchange', async () => {
  class FakeElement {
    constructor(tagName) {
      this.tagName = String(tagName || 'div').toUpperCase();
      this.children = [];
      this.className = '';
      this.textContent = '';
      this.attributes = {};
      this.href = '';
      this.id = '';
      this.firstChild = null;
    }

    appendChild(child) {
      this.children.push(child);
      this.firstChild = this.children[0] || null;
      return child;
    }

    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) {
        this.children.splice(index, 1);
      }
      this.firstChild = this.children[0] || null;
      return child;
    }

    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }
  }

  const originalWindow = global.window;
  const originalDocument = global.document;
  const listeners = {};

  const navRoot = new FakeElement('aside');
  const prevNextRoot = new FakeElement('nav');
  const headingOne = { tagName: 'H2', id: '', textContent: 'Article Switch' };
  const headingTwo = { tagName: 'H3', id: '', textContent: 'Hash Highlight' };
  const articleRoot = {
    querySelectorAll(selector) {
      return selector === 'h2, h3' ? [headingOne, headingTwo] : [];
    },
  };

  const bodyClasses = new Set();
  const documentStub = {
    body: {
      classList: {
        add(...names) {
          names.forEach((name) => bodyClasses.add(name));
        },
      },
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    },
    querySelector(selector) {
      return {
        '[data-notes-nav]': navRoot,
        '[data-notes-article]': articleRoot,
        '[data-notes-prev-next]': prevNextRoot,
      }[selector] || null;
    },
    readyState: 'complete',
    addEventListener() {},
  };

  global.window = {
    location: {
      pathname: '/notes/demo/article-2/',
      hash: '',
    },
    fetch: async () => ({
      ok: true,
      json: async () => require('../source/notes/demo/manifest.json'),
    }),
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };
  global.document = documentStub;

  try {
    await notesLayout.init();

    assert.equal(bodyClasses.has('notes-page'), true);
    assert.equal(typeof listeners.hashchange, 'function');
    assert.equal(headingOne.id, 'article-switch');
    assert.equal(headingTwo.id, 'hash-highlight');

    global.window.location.hash = '#hash-highlight';
    listeners.hashchange();

    const activeArticle = navRoot.children[1].children[1];
    const activeChild = activeArticle.children[1].children[1];
    const activeChildLink = activeChild.children[0];

    assert.match(activeArticle.className, /\bis-active\b/);
    assert.match(activeChild.className, /\bis-active\b/);
    assert.equal(activeChildLink.attributes['aria-current'], 'location');
    assert.equal(activeChildLink.href, '/notes/demo/article-2/#hash-highlight');
    assert.equal(prevNextRoot.children[0].textContent, 'Previous: Demo Article 1: Tree');
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
  }
});

test('demo notes pages do not render a top header or bottom footer band', () => {
  const article1Path = path.join(__dirname, '..', 'source', 'notes', 'demo', 'article-1', 'index.html');
  const article2Path = path.join(__dirname, '..', 'source', 'notes', 'demo', 'article-2', 'index.html');
  const article1 = fs.readFileSync(article1Path, 'utf8');
  const article2 = fs.readFileSync(article2Path, 'utf8');

  assert.equal(article1.includes('notes-header'), false);
  assert.equal(article1.includes('notes-footer'), false);
  assert.equal(article2.includes('notes-header'), false);
  assert.equal(article2.includes('notes-footer'), false);
});
