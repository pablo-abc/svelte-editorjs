# svelte-editorjs

A wrapper for EditorJS in Svelte

## Installation

```sh
# yarn
yarn add @editorjs/editorjs svelte-editorjs

# npm
npm i -S @editorjs/editorjs svelte-editorjs
```

## Usage

To use it import the `createEditor` function from `svelte-editorjs`.

```html
<script>
  import { createEditor } from 'svelte-editorjs';

  const { editor, data, isReady } = createEditor();
</script>

<div use:editor />
```

- `editor` is an action to use in your element that will contain the editor. It can also be used as a readable store that contains the following props:
  - `instance`: the editor's instance as shown in [their docs](https://editorjs.io/api).
  - `save`: a shortcut to `instance.save` that also updates the `data` store.
  - `clear`: a shortcut to `instance.clear` that also updates the `data` store.
  - `render`: a shortcut to `instance.render`.
- `data` is a writable store containing the data from the editor. It'll only be updated on save. Mutating this store will also mutate the editors content.
- `isReady` is a readable store containing a single boolean indicating if the editor is ready to be used.

## Configuration

The `createEditor` accepts the same properties that [EditorjS accepts as options](https://github.com/codex-team/editor.js/blob/master/types/configs/editor-config.d.ts) except for holderId and holder, since that's determined by the action.

## License

MIT
