import EditorJS, { EditorConfig, OutputData } from '@editorjs/editorjs';
import { writable } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

export type EditorStore = {
  instance?: EditorJS;
  save?: () => void;
  render?: (data: OutputData) => void;
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
  data: Writable<OutputData | undefined>;
};

export type SvelteEditorConfig = Omit<EditorConfig, 'holder' | 'holderId'>;

export function createEditor(
  configuration: SvelteEditorConfig = {}
): EditorResponse {
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
  } = writable<OutputData | undefined>(undefined);

  let newSetData = (data: OutputData) => {
    setData(data);
    editorInstance?.render(data);
  };

  function editor(node: HTMLElement, parameters: SvelteEditorConfig = {}) {
    const instance = new EditorJS({
      ...configuration,
      ...parameters,
      holder: node,
    });

    instance.isReady
      .then(() => {
        editorInstance = instance;
        const save = async () => {
          const data = await instance.save();
          setData(data);
        };
        setEditor({
          instance,
          save,
        });
        setIsReady(true);
      })
      .catch(console.error);

    return {
      destroy() {
        instance?.destroy();
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
