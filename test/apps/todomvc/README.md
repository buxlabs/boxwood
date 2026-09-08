# TodoMVC · boxwood

[TodoMVC](https://todomvc.com) implemented with [boxwood](../../..), following
the [application specification](https://github.com/tastejs/todomvc/blob/master/app-spec.md).

It exists to be a whole application rather than a fixture: server rendered
markup, a scoped stylesheet, a client bundle built from several files,
localStorage, and hash routing - the things a page needs at once, rather than
one at a time.

## Running it

```bash
npm start
```

Then open <http://localhost:3000>. Set `PORT` to use another one. Express is
resolved from the repository root, so there is nothing to install here.

Templates are recompiled on every request in development, so editing a
component, the stylesheet or a client file and reloading is enough.

## Testing it

From the repository root:

```bash
npm test
```

or just this app:

```bash
node --test "test/apps/todomvc/*.test.js"
```

The tests render the page and run its bundle in jsdom, by hand rather than
during parsing, so that what the browser had stored and which filter the
address bar asked for are both true before the app starts.

## The framework

Boxwood is a server side template engine whose templates are ordinary
JavaScript functions returning nodes. There is no template syntax and no
runtime on the page: `compile()` gives back a function, calling it gives back
HTML. A component may declare a stylesheet and a client script, and boxwood
collects them - the stylesheet is hashed, minified and inlined into the head,
the scripts are parsed, deduplicated, merged and inlined at the end of the
body. A page is one request.

## How this is put together

```
index.js               the page
index.css              the stylesheet, hashed and inlined
styles.js              the stylesheet, loaded once and shared
components/            the server's markup
  new-todo.js            the field at the top
  todo-list.js           the list, and mark all as complete
  todo-item.js           one row
  toolbar.js             the count, the filters, clear completed
  credits.js             the small print
shared/
  todos.js               the list itself: no DOM, no storage, no browser
client/
  index.js               the entry, bundled into the page
  controllers/app.js     events in, renders out
  models/todos.js        localStorage
  views/item.js          one row, built in the browser
server.js              the preview server
```

**The list logic is written once.** `shared/todos.js` is required by the
server components and imported by the client entry - boxwood resolves a client
script's own imports and understands CommonJS, so what "active" means, or
which todos a filter shows, does not exist twice. It is also the constraint on
that file: it may not reach for anything that exists on only one side.

**The row's markup does exist twice**, in `components/todo-item.js` and in
`client/views/item.js`, because one speaks in boxwood nodes and the other in
DOM calls. That is the seam where a template engine and a browser stop
agreeing, so it is pinned rather than trusted: nothing in a row carries a
scoped class name, and `rendering.test.js` compares an item the browser built
against one the server drew, attribute by attribute.

**Classes are for styling, data attributes are for behaviour.** `css.load`
hashes every class name, which is what scopes the stylesheet - and what means
a script can never ask for one. So anything the client has to find, and any
state it writes, is a data attribute: `[data-item]`, `[data-completed]`,
`[data-editing]`, `[data-hidden]`. Rows are styled through those, scoped by
the list's class, which is also what lets the two representations match.

**The server renders, the browser owns.** The spec asks for localStorage, so
the todos live in the browser and the server renders whatever it was handed -
an empty list from `server.js`, a real one from a test. That render is what a
crawler and a reader without JavaScript get, and on load the client takes it
as its starting point unless storage says otherwise. Storage wins when it has
something; the server's list is the fallback, not the other way round.

**The filter comes from the fragment**, which is never sent to a server, so a
page rendered over HTTP always says "all" and the client corrects it before
the first paint. The `filter` prop is there for a server that does know, and
for the tests, which do.

## Where this differs from the spec

- **No `todomvc-common` or `todomvc-app-css`.** Boxwood inlines a page's
  stylesheet into its head, so the app carries its own, written for it in
  `index.css`. It is the TodoMVC look rather than the TodoMVC stylesheet: the
  same shape, the same behaviour, fewer pixels of it exactly right.
- **The spec's class names are not in the markup.** `completed`, `editing`,
  `destroy`, `selected`, `#main` and `#footer` exist as `[data-completed]`,
  `[data-editing]`, `[data-action="destroy"]`, `[data-selected]`,
  `[data-main]` and `[data-footer]`. Those names are in the spec so that the
  shared stylesheet and the shared browser tests can find things; with the
  stylesheet scoped and the tests written here, the convention that survives
  is boxwood's. Every requirement about *behaviour* is implemented as written.
- **The new todo field is in a form**, with a submit button that is reachable
  but off the screen. Enter submits a form for free, so there is no key to
  name - and a real button means that stays true if the form ever gains a
  second field.
- **`package.json` declares no dependencies.** Express is a devDependency of
  the repository this app lives in, and boxwood is the parent directory.
