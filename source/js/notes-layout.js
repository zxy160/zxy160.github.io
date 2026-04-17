(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.NotesLayout = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizePath(pathname) {
    const value = String(pathname || '').replace(/index\.html$/i, '');
    const stripped = value.replace(/[?#].*$/, '').replace(/\/+$/, '');
    return stripped ? `${stripped}/` : '/';
  }

  function parseNotesPath(pathname) {
    const articlePath = normalizePath(pathname);
    const match = articlePath.match(/^\/notes\/([^/]+)\/([^/]+)\/$/);

    if (!match) {
      return {
        isNotesPage: false,
        group: null,
        articlePath,
        manifestPath: null,
      };
    }

    const group = match[1];

    return {
      isNotesPage: true,
      group,
      articlePath,
      manifestPath: `/notes/${group}/manifest.json`,
    };
  }

  function slugify(text, used) {
    const textValue = String(text || '').trim().toLowerCase();
    const base = textValue
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
    const seen = used || new Set();

    let candidate = base;
    let suffix = 2;
    while (seen.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    seen.add(candidate);
    return candidate;
  }

  function extractHeadingItems(headings) {
    const relevant = [];
    const used = new Set();

    for (const heading of headings || []) {
      const tagName = String(heading.tagName || '').toUpperCase();
      if (tagName !== 'H2' && tagName !== 'H3') {
        continue;
      }

      relevant.push(heading);

      const existingId = String(heading.id || '').trim();
      if (existingId) {
        used.add(existingId);
      }
    }

    return relevant.map((heading) => {
      const tagName = String(heading.tagName || '').toUpperCase();
      const text = String(heading.textContent || heading.text || '').trim();
      const existingId = String(heading.id || '').trim();
      const id = existingId || slugify(text, used);

      used.add(id);

      return {
        level: Number(tagName.slice(1)),
        id,
        text,
      };
    });
  }

  function buildTreeModel(manifest, currentPath, hash, headings) {
    const normalizedCurrent = normalizePath(currentPath);
    const currentHash = String(hash || '');

    return {
      title: manifest.title,
      items: (manifest.articles || []).map((article) => {
        const path = normalizePath(article.path);
        const active = path === normalizedCurrent;

        return {
          title: article.title,
          path,
          active,
          expanded: active,
          children: active
            ? (headings || []).map((heading) => ({
                title: heading.text,
                href: `${path}#${heading.id}`,
                active: currentHash === `#${heading.id}`,
                level: heading.level,
              }))
            : [],
        };
      }),
    };
  }

  function buildPrevNext(manifest, currentPath) {
    const articles = manifest.articles || [];
    const normalizedCurrent = normalizePath(currentPath);
    const index = articles.findIndex((article) => normalizePath(article.path) === normalizedCurrent);

    return {
      prev: index > 0 ? articles[index - 1] : null,
      next: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
    };
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (text !== undefined && text !== null) {
      element.textContent = text;
    }

    return element;
  }

  function collectHeadings(articleRoot) {
    if (!articleRoot || typeof articleRoot.querySelectorAll !== 'function') {
      return [];
    }

    return Array.from(articleRoot.querySelectorAll('h2, h3'));
  }

  function renderTree(navRoot, treeModel) {
    if (!navRoot) {
      return;
    }

    while (navRoot.firstChild) {
      navRoot.removeChild(navRoot.firstChild);
    }

    if (!treeModel) {
      return;
    }

    navRoot.appendChild(createElement('div', 'notes-tree-title', treeModel.title || ''));

    const list = createElement('ul', 'notes-tree-list');
    for (const item of treeModel.items || []) {
      const articleItem = createElement(
        'li',
        item.active ? 'notes-tree-item is-active' : 'notes-tree-item'
      );
      const articleLink = createElement('a', 'notes-tree-link', item.title || '');
      articleLink.href = item.path;

      if (item.active) {
        articleLink.setAttribute('aria-current', 'page');
      }

      articleItem.appendChild(articleLink);

      if (item.children && item.children.length) {
        const childList = createElement('ul', 'notes-tree-children');

        for (const child of item.children) {
          const childItem = createElement(
            'li',
            child.active
              ? `notes-tree-child level-${child.level} is-active`
              : `notes-tree-child level-${child.level}`
          );
          const childLink = createElement('a', 'notes-tree-child-link', child.title || '');
          childLink.href = child.href;

          if (child.active) {
            childLink.setAttribute('aria-current', 'location');
          }

          childItem.appendChild(childLink);
          childList.appendChild(childItem);
        }

        articleItem.appendChild(childList);
      }

      list.appendChild(articleItem);
    }

    navRoot.appendChild(list);
  }

  function renderPrevNext(target, prevNext) {
    if (!target) {
      return;
    }

    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }

    if (!prevNext) {
      return;
    }

    if (prevNext.prev) {
      const prevLink = createElement('a', 'notes-prev-next-link is-prev', `Previous: ${prevNext.prev.title}`);
      prevLink.href = prevNext.prev.path;
      target.appendChild(prevLink);
    }

    if (prevNext.next) {
      const nextLink = createElement('a', 'notes-prev-next-link is-next', `Next: ${prevNext.next.title}`);
      nextLink.href = prevNext.next.path;
      target.appendChild(nextLink);
    }
  }

  let initPromise = null;
  let mountedNotesState = null;
  let hashListenerAttached = false;

  function renderMountedNotesState() {
    if (!mountedNotesState || typeof window === 'undefined') {
      return;
    }

    const treeModel = buildTreeModel(
      mountedNotesState.manifest,
      mountedNotesState.page.articlePath,
      window.location.hash,
      mountedNotesState.headingItems
    );

    renderTree(mountedNotesState.navRoot, treeModel);
    renderPrevNext(
      mountedNotesState.prevNextRoot,
      buildPrevNext(mountedNotesState.manifest, mountedNotesState.page.articlePath)
    );
  }

  function handleHashChange() {
    renderMountedNotesState();
  }

  async function init() {
    if (initPromise) {
      return initPromise;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const page = parseNotesPath(window.location.pathname);
    if (!page.isNotesPage) {
      return undefined;
    }

    const navRoot = document.querySelector('[data-notes-nav]');
    const articleRoot = document.querySelector('[data-notes-article]');
    const prevNextRoot = document.querySelector('[data-notes-prev-next]');

    if (!navRoot || !articleRoot || !prevNextRoot) {
      return undefined;
    }

    initPromise = (async () => {
      document.body.classList.add('notes-page');

      try {
        const response = await window.fetch(page.manifestPath, { cache: 'no-store' });
        if (!response || !response.ok) {
          throw new Error('Failed to load notes manifest');
        }

        const manifest = await response.json();
        if (!manifest || !Array.isArray(manifest.articles)) {
          throw new Error('Invalid notes manifest');
        }

        const headingElements = collectHeadings(articleRoot);
        const headingItems = extractHeadingItems(headingElements);

        headingElements.forEach((heading, index) => {
          const item = headingItems[index];
          if (item) {
            heading.id = item.id;
          }
        });

        mountedNotesState = {
          manifest,
          page,
          navRoot,
          prevNextRoot,
          headingItems,
        };

        if (!hashListenerAttached) {
          window.addEventListener('hashchange', handleHashChange);
          hashListenerAttached = true;
        }

        renderMountedNotesState();
      } catch (error) {
        mountedNotesState = null;
        document.body.classList.add('notes-page-manifest-missing');
      }
    })();

    return initPromise;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const autoInit = () => {
      init();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit, { once: true });
    } else {
      autoInit();
    }
  }

  return {
    normalizePath,
    parseNotesPath,
    slugify,
    extractHeadingItems,
    buildTreeModel,
    buildPrevNext,
    createElement,
    collectHeadings,
    renderTree,
    renderPrevNext,
    renderMountedNotesState,
    handleHashChange,
    init,
  };
});
