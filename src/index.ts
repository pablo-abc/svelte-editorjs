import type EditorJS from '@editorjs/editorjs';
import type { EditorConfig, OutputData } from '@editorjs/editorjs';
import { writable } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

export type EditorStore = {
  instance?: EditorJS;
  save?: () => void;
  render?: (data: OutputData) => void;
  clear?: () => void;
};

export type EditorStoreAction = ((
  node: HTMLElement,
  parameters?: EditorConfig
) => {
  destroy?: () => void;
}) &
  Readable<EditorStore>;

export type EditorResponse = {
  editor: EditorStoreAction;
  isReady: Readable<boolean>;
  data: Writable<OutputData>;
};

export type SvelteEditorConfig = Omit<EditorConfig, 'holder' | 'holderId'>;

export function createEditor(
  configuration: SvelteEditorConfig = {}
): EditorResponse {
  const initialData = configuration.data ?? {
    time: new Date().getTime(),
    blocks: [],
  };
  let editorInstance: EditorJS | undefined;
  const { subscribe: subscribeEditor, set: setEditor } = writable<EditorStore>(
    {}
  );
  const { subscribe: subscribeIsReady, set: setIsReady } = writable<boolean>(
    false
  );
  const {
    subscribe: subscribeData,
    set: setData,
    update: updateData,
  } = writable<OutputData>(initialData);

  let newSetData = (data: OutputData) => {
    updateData((oldData) => ({ ...oldData, ...data }));
    editorInstance?.render(data);
  };

  function editor(node: HTMLElement, parameters: SvelteEditorConfig = {}) {
    async function setup() {
      if (typeof window === 'undefined') return;
      const Editor = await import('@editorjs/editorjs');
      const instance = new Editor.default({
        ...configuration,
        ...parameters,
        holder: node,
      });

      instance.isReady
        .then(() => {
          editorInstance = instance;
          if (parameters.data) setData(parameters.data);

          const save = async () => {
            const data = await instance.save();
            setData(data);
          };

          const clear = async () => {
            instance.clear();
            updateData((data) => ({
              ...data,
              time: new Date().getTime(),
              blocks: [],
            }));
          };

          const render = async (data: OutputData) => {
            instance.render(data);
          };

          setEditor({
            instance,
            save,
            render,
            clear,
          });
          setIsReady(true);
        })
        .catch(console.error);
    }
    setup();
    return {
      destroy() {
        editorInstance?.destroy();
      },
    };
  }

  editor.subscribe = subscribeEditor;

  return {
    editor,
    isReady: { subscribe: subscribeIsReady },
    data: { subscribe: subscribeData, set: newSetData, update: updateData },
  };
}
