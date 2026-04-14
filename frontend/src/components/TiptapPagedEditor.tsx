import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ResizableImage } from './ResizableImage';
import { InlineImage } from './InlineImage'; // Import InlineImage node
import { API_BASE_URL } from '../constants/api';
import Underline from '@tiptap/extension-underline';
import FileHandler from '@tiptap/extension-file-handler';
import { Node, mergeAttributes } from '@tiptap/core';
import { PaginationPlus } from 'tiptap-pagination-plus';
import { resolveShortcodes } from '../constants/media';
import { Dropdown } from 'react-bootstrap';
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdInsertPageBreak, MdArrowDropDown } from 'react-icons/md';


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML() {
    return [
      { tag: 'div[data-type="page-break"]' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break' })];
  },
  addCommands() {
    return {
      setPageBreak: () => ({ commands }: { commands: any }) => {
        return commands.insertContent('<div data-type="page-break"></div>');
      },
    } as any;
  },
});

import tippy, { type Instance as TippyInstance } from 'tippy.js';
import MentionList from './MentionList';

import 'tippy.js/dist/tippy.css';

interface Entity {
  id?: number | string;
  name: string;
  imageUrl?: string;
  icon?: string;
  type?: string;
}

interface TiptapPagedEditorProps {
  content: string;
  characters?: Entity[];
  items?: Entity[];
  locations?: Entity[];
  lore?: Entity[];
  species?: Entity[];
  emotes?: Entity[];
  onRefreshEmotes?: () => void;
  onChange: (html: string) => void;
  onPageCountChange?: (count: number) => void;
  onSave?: () => void;
  onMentionClick?: (id: number, type: string, isMiddleClick?: boolean) => void;
  storyId?: string; // Add storyId to interface
}

const TiptapPagedEditor = ({
  content,
  characters = [],
  items = [],
  locations = [],
  lore = [],
  species = [],
  emotes = [],
  onRefreshEmotes,
  onChange,
  onPageCountChange,
  onSave,
  onMentionClick,
  storyId,
}: TiptapPagedEditorProps) => {
  const onSaveRef = useRef(onSave);
  const onChangeRef = useRef(onChange);
  const onPageCountChangeRef = useRef(onPageCountChange);
  const lastSentContent = useRef(content);
  
    useEffect(() => {
      onSaveRef.current = onSave;
      onChangeRef.current = onChange;
      onPageCountChangeRef.current = onPageCountChange;
    }, [onSave, onChange, onPageCountChange]);
  
    const allEntities = useMemo(() => {
      const filter = (e: Entity) => e.id !== undefined;
      return [
        ...characters.filter(filter).map(e => ({ ...e, type: 'character', icon: '👤' })),
        ...items.filter(filter).map(e => ({ ...e, type: 'item', icon: '📦' })),
        ...locations.filter(filter).map(e => ({ ...e, type: 'location', icon: '📍' })),
        ...lore.filter(filter).map(e => ({ ...e, type: 'lore', icon: '📜' })),
        ...species.filter(filter).map(e => ({ ...e, type: 'species', icon: '🐾' })),
        ...emotes.map((e: Entity) => ({ ...e, id: e.imageUrl!, type: 'emote', icon: e.icon || '😁', imageUrl: resolveShortcodes(e.imageUrl) }))
      ];
    }, [characters, items, locations, lore, species, emotes]);
  
    const allEntitiesRef = useRef(allEntities);
    useEffect(() => {
      allEntitiesRef.current = allEntities;
    }, [allEntities]);

    const toBubbles = useMemo(() => (text: string) => {
      if (!text) return '';
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // 1. Resolve images in src attributes
      const images = doc.querySelectorAll('img');
      images.forEach(img => {
          const src = img.getAttribute('src');
          if (src?.startsWith('#{image:') || src?.startsWith('#{emote:')) {
              const uuid = src.substring(src.indexOf(':') + 1, src.indexOf('}'));
              img.setAttribute('src', `${API_BASE_URL}/api/media/${uuid}`);
              if (src.startsWith('#{emote:')) {
                  img.classList.add('inline-image-emote');
              }
          }
      });

      // 2. Resolve mentions and pagebreaks in the resulting HTML string
      let processed = doc.body.innerHTML;
      processed = processed.replace(/#\{(\w+):(\d+)\}/g, (_match, type, id) => {
        const entity = allEntities.find(e => e.id !== undefined && e.type === type.toLowerCase() && e.id.toString() === id);
        const name = entity ? entity.name : `Unknown ${type}`;
        return `<span data-type="mention" data-id="${id}" data-entity-type="${type.toLowerCase()}" data-label="${name}">${name}</span>`;
      });
      processed = processed.replace(/#\{pagebreak\}/g, '<div data-type="page-break"></div>');
      
      // 3. Fallback for raw image shortcodes not in img tags
      processed = processed.replace(/#\{image:([\w\-]+)\}/g, (_match, id) => {
          return `<img src="${API_BASE_URL}/api/media/${id}" />`;
      });
      processed = processed.replace(/#\{emote:([\w\-]+)\}/g, (_match, id) => {
          return `<img src="${API_BASE_URL}/api/media/${id}" class="inline-image-emote" />`;
      });

      return processed;
    }, [allEntities]);

    const toShortcodes = useMemo(() => (html: string) => {
      if (!html) return '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
  
      const mentions = doc.querySelectorAll('span[data-type="mention"]');
      mentions.forEach(el => {
          const type = el.getAttribute('data-entity-type');
          const id = el.getAttribute('data-id');
          if (type && id) {
              el.outerHTML = `#{${type}:${id}}`;
          }
      });
  
      const pageBreaks = doc.querySelectorAll('div[data-type="page-break"]');
      pageBreaks.forEach(el => {
          el.outerHTML = '#{pagebreak}';
      });

      const images = doc.querySelectorAll('img');
      images.forEach(img => {
          const src = img.getAttribute('src');
          if (src?.includes('/api/media/')) {
              const uuid = src.split('/').pop();
              const isEmote = img.classList.contains('inline-image-emote') || img.getAttribute('data-type') === 'emote';
              img.setAttribute('src', `#{${isEmote ? 'emote' : 'image'}:${uuid}}`);
          }
      });
  
      let result = doc.body.innerHTML;
      result = result.replace(/\uFEFF/g, '');
      result = result.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
      return result;
    }, []);
  
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          undoRedo: {
              depth: 100,
          }
        }),
        Underline,
        ResizableImage.configure({ 
          storyId: storyId,
          onEmoteCreated: onRefreshEmotes
        }),
        InlineImage, // Add InlineImage extension
        FileHandler.configure({
        onDrop: (currentEditor, files) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch(`${API_BASE_URL}/api/upload`, {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'resizableImage',
                    attrs: { src: `${API_BASE_URL}${data.url}` },
                  }).focus().run();
                }
              } catch (err) {
                console.error('Failed to upload dropped image:', err);
              }
            }
          });
        },
        onPaste: (currentEditor, files) => {
          files.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await fetch(`${API_BASE_URL}/api/upload`, {
                  method: 'POST',
                  body: formData
                });
                if (response.ok) {
                  const data = await response.json();
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'resizableImage',
                    attrs: { src: `${API_BASE_URL}${data.url}` },
                  }).focus().run();
                }
              } catch (err) {
                console.error('Failed to upload pasted image:', err);
              }
            }
          });
        },
      }),
      PageBreak,
      PaginationPlus.configure({
        pageHeight: 1123,
        pageWidth: 794,
        pageGap: 50,
        pageGapBorderSize: 1,
        pageGapBorderColor: "#333",
        pageBreakBackground: "#000",
        footerRight: "Page {page}",
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 60,
        marginRight: 60,
        contentMarginTop: 40,
        contentMarginBottom: 40,
      }),
            Mention.extend({
              name: 'mention',
              addAttributes() {
                return {
                  id: {
                    default: null,
                    parseHTML: element => element.getAttribute('data-id'),
                    renderHTML: attributes => {
                      if (!attributes.id) {
                        return {}
                      }
                      return {
                        'data-id': attributes.id,
                      }
                    },
                  },
                  label: {
                    default: null,
                    parseHTML: element => element.getAttribute('data-label'),
                    renderHTML: attributes => {
                      if (!attributes.label) {
                        return {}
                      }
                      return {
                        'data-label': attributes.label,
                      }
                    },
                  },
                  'entity-type': {
                    default: null,
                    parseHTML: element => element.getAttribute('data-entity-type'),
                    renderHTML: attributes => {
                      if (!attributes['entity-type']) {
                        return {}
                      }
                      return {
                        'data-entity-type': attributes['entity-type'],
                      }
                    },
                  },
                }
              },
            }).configure({
              HTMLAttributes: {
                class: 'mention',
              },
              suggestion: {
                char: '#',
                items: ({ query }) => {
                  const values = (allEntitiesRef.current as any[])
                    .filter((e) => e.type !== 'emote')
                    .map((e) => ({
                      id: e.id,
                      label: e.name,
                      name: e.name,
                      type: e.type,
                      icon: e.icon
                    }));
      
                  if (query.length === 0) {
                    return values;
                  } else {
                    return values.filter((item) =>
                      item.label.toLowerCase().includes(query.toLowerCase())
                    );
                  }
                },
                command: ({ editor, range, props }: any) => {
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(range, [
                      {
                        type: 'mention',
                        attrs: {
                          id: props.id,
                          label: props.label,
                          'entity-type': props.type,
                        },
                      },
                      {
                        type: 'text',
                        text: ' ',
                      },
                    ])
                    .run();
                },
                render: () => {
                  let component: ReactRenderer<any>;
                  let popup: TippyInstance[];
      
                  return {
                    onStart: (props) => {
                      component = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                      });
      
                      if (!props.clientRect) {
                        return;
                      }
      
                      popup = tippy('body', {
                        getReferenceClientRect: props.clientRect as any,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                      });
                    },
      
                    onUpdate(props) {
                      component.updateProps(props);
      
                      if (!props.clientRect) {
                        return;
                      }
      
                      popup[0].setProps({
                        getReferenceClientRect: props.clientRect as any,
                      });
                    },
      
                    onKeyDown(props) {
                      if (props.event.key === 'Escape') {
                        popup[0].hide();
                        return true;
                      }
      
                      return component.ref?.onKeyDown(props);
                    },
      
                    onExit() {
                      popup[0].destroy();
                      component.destroy();
                    },
                  };
                },
              },
            }),
            Mention.extend({
              name: 'emoteSuggestion',
            }).configure({
                      suggestion: {
                        char: ':',
                        items: ({ query }) => {
                          const values = (allEntitiesRef.current as any[])
                            .filter((e) => e.type === 'emote')
                            .map((e) => ({
                              id: e.id,
                              label: e.name,
                              name: e.name, // Ensure name is available for command
                              type: e.type,
                              icon: e.icon,
                              imageUrl: e.imageUrl
                            }));      
                  if (query.length === 0) {
                    return values;
                  } else {
                    return values.filter((item) =>
                      item.label.toLowerCase().includes(query.toLowerCase())
                    );
                  }
                },
                command: ({ editor, range, props }: any) => {
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(range, [
                      {
                        type: 'inlineImage',
                        attrs: {
                          src: props.id, // props.id is imageUrl for emotes
                          emoteName: props.name,
                        },
                      },
                      {
                        type: 'text',
                        text: ' ',
                      },
                    ])
                    .run();
                },
                render: () => {
                  let component: ReactRenderer<any>;
                  let popup: TippyInstance[];
      
                  return {
                    onStart: (props) => {
                      component = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                      });
      
                      if (!props.clientRect) {
                        return;
                      }
      
                      popup = tippy('body', {
                        getReferenceClientRect: props.clientRect as any,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                      });
                    },
      
                    onUpdate(props) {
                      component.updateProps(props);
      
                      if (!props.clientRect) {
                        return;
                      }
      
                      popup[0].setProps({
                        getReferenceClientRect: props.clientRect as any,
                      });
                    },
      
                    onKeyDown(props) {
                      if (props.event.key === 'Escape') {
                        popup[0].hide();
                        return true;
                      }
      
                      return component.ref?.onKeyDown(props);
                    },
      
                    onExit() {
                      popup[0].destroy();
                      component.destroy();
                    },
                  };
                },
              },
            }),
      ],
      content: toBubbles(content),
      onCreate: ({ editor }) => {
        // Trigger a re-pagination after a short delay to account for Tauri initialization
        setTimeout(() => {
            editor.commands.focus();
            editor.view.dispatch(editor.state.tr);
        }, 1000);
      },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const shortcodeVersion = toShortcodes(html);
      if (shortcodeVersion !== lastSentContent.current) {
        lastSentContent.current = shortcodeVersion;
        onChangeRef.current(shortcodeVersion);
      }
    },
    editorProps: {
        handleDOMEvents: {
            keydown: (_view, event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    if (onSaveRef.current) {
                        onSaveRef.current();
                    }
                    return true;
                }
                return false;
            },
            mousedown: (view, event) => {
                if (event.button === 1) {
                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (pos) {
                        const node = view.state.doc.nodeAt(pos.pos);
                        if (node && node.type.name === 'mention') {
                            event.preventDefault();
                            event.stopPropagation();
                            if (onMentionClick) {
                                onMentionClick(node.attrs.id, node.attrs['entity-type'], true);
                            }
                            return true;
                        }
                    }
                }
                return false;
            },
            click: (view, event) => {
                if (event.ctrlKey || event.metaKey) {
                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (pos) {
                        const node = view.state.doc.nodeAt(pos.pos);
                        if (node && node.type.name === 'mention') {
                            event.preventDefault();
                            event.stopPropagation();
                            if (onMentionClick) {
                                onMentionClick(node.attrs.id, node.attrs['entity-type']);
                            }
                            return true;
                        }
                    }
                }
                return false;
            }
        }
    }
  }, [storyId]);

  useEffect(() => {
    if (!editor) return;

    const targetNode = editor.view.dom;
    const config = { childList: true, subtree: true };
    let timeoutId: any = null;

    const callback = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const editorDom = editor.view.dom;
        const pages = editorDom.querySelectorAll('.rm-page-break');
        const count = pages.length;
        const hasContent = editor.getText().trim().length > 0;
        
        // Check for "stalled" pagination:
        // If there are nodes in the editor that are not .rm-page-break, it might be stalled.
        // The extension usually moves everything into .rm-page-break.
        const rootNodes = Array.from(editorDom.childNodes);
        const unpaginatedNodes = rootNodes.filter(node => {
            if (node instanceof HTMLElement) {
                return !node.classList.contains('rm-page-break') && 
                       !node.classList.contains('page') && 
                       !node.classList.contains('tippy-content') && // Ignore tippy
                       node.tagName !== 'BR'; // Ignore trailing BRs
            }
            return false;
        });

        if (unpaginatedNodes.length > 0 && hasContent) {
            // Nudge the editor to force a re-pagination pass
            editor.commands.focus();
            // Also try a no-op transaction
            editor.view.dispatch(editor.state.tr);
        }

        if (count > 100) {
            console.error('[TiptapPagedEditor] Potential infinite pagination detected.');
            return;
        }

        if (onPageCountChangeRef.current) {
          if (count > 0 || !hasContent) {
            onPageCountChangeRef.current(count);
          } else if (hasContent && count === 0) {
            onPageCountChangeRef.current(1);
          }
        }
      }, 500); // Reduced debounce to 500ms for better responsiveness
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    callback();

    return () => {
        observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [editor]);

  useEffect(() => {
    if (content !== lastSentContent.current) {
      const nextValue = toBubbles(content);
      if (editor && nextValue !== editor.getHTML()) {
        editor.commands.setContent(nextValue);
        lastSentContent.current = content;
        
        // Nudge after setting content to ensure pagination starts
        setTimeout(() => {
            if (editor && !editor.isDestroyed) {
                editor.view.dispatch(editor.state.tr);
            }
        }, 100);
      }
    }
  }, [content, editor, toBubbles]);

  const [currentHeading, setCurrentHeading] = useState('Normal');

  useEffect(() => {
    if (!editor) return;

    const updateHeading = () => {
      if (editor.isActive('heading', { level: 1 })) {
        setCurrentHeading('H1');
      } else if (editor.isActive('heading', { level: 2 })) {
        setCurrentHeading('H2');
      } else if (editor.isActive('heading', { level: 3 })) {
        setCurrentHeading('H3');
      } else {
        setCurrentHeading('Normal');
      }
    };

    editor.on('selectionUpdate', updateHeading);
    editor.on('transaction', updateHeading);
    
    // Initial check
    updateHeading();

    return () => {
      editor.off('selectionUpdate', updateHeading);
      editor.off('transaction', updateHeading);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-paged-editor-wrapper">
      <BubbleMenu {...({ editor, tippyOptions: { duration: 100, zIndex: 10000, appendTo: document.body } } as any)}>
        <div className="bubble-menu">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <MdFormatBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <MdFormatItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
            title="Underline"
          >
            <MdFormatUnderlined />
          </button>
          <div className="menu-divider" />
          
          <Dropdown>
            <Dropdown.Toggle as="button" className="bubble-menu-dropdown-toggle">
              <span>{currentHeading}</span>
              <MdArrowDropDown style={{ fontSize: '1rem' }} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="bubble-menu-dropdown-menu">
              <Dropdown.Header style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.4rem 1rem' }}>Text Style</Dropdown.Header>
              <Dropdown.Item 
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Heading 1</span>
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Heading 2</span>
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Heading 3</span>
              </Dropdown.Item>
              <Dropdown.Divider style={{ borderColor: '#444' }} />
              <Dropdown.Item 
                onClick={() => editor.chain().focus().setParagraph().run()}
                active={editor.isActive('paragraph')}
              >
                Normal Text
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <div className="menu-divider" />
          <button
            onClick={() => editor.chain().focus().setPageBreak().run()}
            title="Page Break"
          >
            <MdInsertPageBreak />
          </button>
        </div>
      </BubbleMenu>
      
      <EditorContent editor={editor} />

      <style>{`
        /* Global z-index fix for all tippy instances (BubbleMenu, Mentions, etc.) */
        .tippy-box {
          z-index: 10000 !important;
          position: relative !important;
        }

        .tiptap-paged-editor-wrapper {
          width: 100%;
          background-color: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .ProseMirror {
          outline: none;
          color: #eee;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          line-height: 1.6;
          background-color: #1e1e1e; /* Whole editor background */
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
          min-height: 1123px;
        }

        .ProseMirror h1 { font-size: 2.2rem; margin-top: 1.5rem; margin-bottom: 1rem; color: #fff; }
        .ProseMirror h2 { font-size: 1.8rem; margin-top: 1.2rem; margin-bottom: 0.8rem; color: #fff; }
        .ProseMirror h3 { font-size: 1.5rem; margin-top: 1rem; margin-bottom: 0.6rem; color: #fff; }

        .ProseMirror img {
          /* max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
          border-radius: 8px; */
        }

        /* Essential Pagination Styling - Do not add borders/paddings to these classes directly */
        .rm-page-break {
          overflow: visible !important;
        }

        .page {
           overflow: visible !important;
        }

        .mention {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #90caf9;
          background-color: rgba(144, 202, 249, 0.1);
          padding: 0 6px;
          margin: 0 2px;
          border-radius: 4px;
          border-bottom: 1px dashed rgba(144, 202, 249, 0.4);
          user-select: all;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
          vertical-align: middle;
          height: 1.5em;
          width: auto;
        }
        .mention:hover {
          background-color: rgba(144, 202, 249, 0.2);
          color: #fff;
          border-bottom: 1px solid #90caf9;
        }

        /* Page Break Styling */
        div[data-type="page-break"] {
          border-top: 2px dashed #444;
          margin: 2rem 0;
          position: relative;
          height: 0;
          page-break-after: always;
          break-after: page;
        }

        .bubble-menu {
          display: flex;
          background-color: #252525;
          padding: 0.2rem;
          border-radius: 0.5rem;
          border: 1px solid #444;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 10000;
          position: relative;
        }

        .bubble-menu button {
          border: none;
          background: none;
          color: #eee;
          padding: 0.4rem 0.6rem;
          border-radius: 0.3rem;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .bubble-menu button:hover {
          background-color: #333;
        }

        .bubble-menu button.is-active {
          color: #90caf9;
          background-color: rgba(144, 202, 249, 0.1);
        }

        .bubble-menu-dropdown-toggle {
          border: 1px solid #444;
          background-color: #333;
          color: #eee;
          padding: 0.2rem 0.5rem;
          margin: 0 0.2rem;
          border-radius: 0.3rem;
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 65px;
          justify-content: space-between;
          font-size: 0.85rem;
          transition: all 0.2s;
          height: 28px;
          align-self: center;
        }

        .bubble-menu-dropdown-toggle:hover {
          background-color: #444;
          border-color: #555;
          color: #fff;
        }

        .bubble-menu-dropdown-toggle span {
          flex: 1;
          text-align: center;
        }

        .bubble-menu-dropdown-toggle::after {
          display: none !important;
        }

        .bubble-menu-dropdown-menu {
          background-color: #252525 !important;
          border: 1px solid #444 !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.5) !important;
          z-index: 10001 !important;
          padding: 0.5rem 0 !important;
        }

        .bubble-menu-dropdown-menu .dropdown-item {
          color: #eee !important;
          font-size: 0.95rem;
          padding: 0.6rem 1.2rem;
          display: flex;
          align-items: center;
        }

        .bubble-menu-dropdown-menu .dropdown-item:hover {
          background-color: #333 !important;
          color: #fff !important;
        }

        .bubble-menu-dropdown-menu .dropdown-item.active {
          background-color: rgba(144, 202, 249, 0.2) !important;
          color: #90caf9 !important;
        }

        .menu-divider {
          width: 1px;
          background-color: #444;
          margin: 0.2rem 0.4rem;
          align-self: stretch;
        }
      `}</style>
    </div>
  );
};

export default TiptapPagedEditor;
