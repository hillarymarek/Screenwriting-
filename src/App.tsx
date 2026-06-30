/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  RefreshCw,
  PenSquare,
  ChevronUp,
  ChevronDown,
  History,
  BookOpen,
  Printer,
  Info,
  X,
  Check,
  FileCode2,
  ListRestart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Screenplay,
  ScreenplayElement,
  ScreenplayElementType,
  HistoryItem
} from './types';
import { SAMPLE_DRAFTS, INITIAL_SCRIPT } from './data';

export default function App() {
  // Local state persistence
  const [screenplay, setScreenplay] = useState<Screenplay>(() => {
    const saved = localStorage.getItem('screenplay');
    return saved ? JSON.parse(saved) : INITIAL_SCRIPT;
  });

  const [draftText, setDraftText] = useState(() => {
    return localStorage.getItem('draftText') || SAMPLE_DRAFTS[0].text;
  });

  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [formatOption, setFormatOption] = useState('Adapt raw notes precisely into clean script elements');
  const [isFormatting, setIsFormatting] = useState(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Element order or active item helpers
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('screenplayHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Track script title or author edits
  const [isEditingHeader, setIsEditingHeader] = useState<'title' | 'author' | null>(null);
  const [headerEditTitle, setHeaderEditTitle] = useState(screenplay.title);
  const [headerEditAuthor, setHeaderEditAuthor] = useState(screenplay.author);

  // Sync edits
  useEffect(() => {
    localStorage.setItem('screenplay', JSON.stringify(screenplay));
    setHeaderEditTitle(screenplay.title);
    setHeaderEditAuthor(screenplay.author);
  }, [screenplay]);

  useEffect(() => {
    localStorage.setItem('draftText', draftText);
  }, [draftText]);

  useEffect(() => {
    localStorage.setItem('screenplayHistory', JSON.stringify(historyList));
  }, [historyList]);

  // Handle sample draft selection
  const loadSampleDraft = (draftId: string) => {
    const sample = SAMPLE_DRAFTS.find(d => d.id === draftId);
    if (sample) {
      setDraftText(sample.text);
      setSuccessMessage(`Loaded "${sample.name}" template!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Change individual element type
  const changeElementType = (id: string, newType: ScreenplayElementType) => {
    setScreenplay(prev => {
      const updatedElements = prev.elements.map(el => {
        if (el.id === id) {
          let updatedText = el.text;
          if (newType === 'Character' || newType === 'Scene Heading' || newType === 'Transition') {
            updatedText = updatedText.toUpperCase();
          } else if (newType === 'Parenthetical') {
            if (!updatedText.startsWith('(')) updatedText = `(${updatedText}`;
            if (!updatedText.endsWith(')')) updatedText = `${updatedText})`;
          }
          return { ...el, type: newType, text: updatedText };
        }
        return el;
      });
      return { ...prev, elements: updatedElements };
    });
  };

  // Edit element content
  const updateElementText = (id: string, text: string) => {
    setScreenplay(prev => ({
      ...prev,
      elements: prev.elements.map(el => (el.id === id ? { ...el, text } : el))
    }));
  };

  // Delete specific element
  const deleteElement = (id: string) => {
    setScreenplay(prev => {
      const filtered = prev.elements.filter(el => el.id !== id);
      if (filtered.length === 0) {
        return {
          ...prev,
          elements: [{ id: 'empty-1', type: 'Action', text: 'Insert script elements here.' }]
        };
      }
      return { ...prev, elements: filtered };
    });
  };

  // Move element index
  const moveElement = (id: string, direction: 'up' | 'down') => {
    setScreenplay(prev => {
      const elements = [...prev.elements];
      const index = elements.findIndex(el => el.id === id);
      if (index === -1) return prev;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= elements.length) return prev;

      const temp = elements[index];
      elements[index] = elements[swapIndex];
      elements[swapIndex] = temp;

      return { ...prev, elements };
    });
  };

  // Insert element directly below target ID
  const insertElementBelow = (id: string, preferredType?: ScreenplayElementType) => {
    const defaultType = preferredType || 'Action';
    const newId = `new-el-${Date.now()}`;
    
    setScreenplay(prev => {
      const elements = [...prev.elements];
      const index = elements.findIndex(el => el.id === id);
      
      const newEl: ScreenplayElement = {
        id: newId,
        type: defaultType,
        text: defaultType === 'Parenthetical' ? '(whispering)' : ''
      };

      if (index === -1) {
        elements.push(newEl);
      } else {
        elements.splice(index + 1, 0, newEl);
      }
      return { ...prev, elements };
    });

    // Automatically focus the new element
    setTimeout(() => {
      setActiveElementId(newId);
    }, 50);
  };

  // Keyboard operations
  const handleKeyboardEnter = (currentId: string, currentType: ScreenplayElementType, textVal: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      let nextType: ScreenplayElementType = 'Action';
      switch (currentType) {
        case 'Scene Heading':
          nextType = 'Action';
          break;
        case 'Character':
          nextType = 'Dialogue';
          break;
        case 'Dialogue':
          nextType = 'Character';
          break;
        case 'Parenthetical':
          nextType = 'Dialogue';
          break;
        case 'Action':
          nextType = 'Action';
          break;
        case 'Transition':
          nextType = 'Scene Heading';
          break;
        case 'Shot':
          nextType = 'Action';
          break;
      }
      
      insertElementBelow(currentId, nextType);
    }
  };

  const handleKeyboardTab = (currentId: string, currentType: ScreenplayElementType, event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      
      const typesList: ScreenplayElementType[] = [
        'Scene Heading',
        'Action',
        'Character',
        'Parenthetical',
        'Dialogue',
        'Transition',
        'Shot'
      ];
      
      const currentIndex = typesList.indexOf(currentType);
      const direction = event.shiftKey ? -1 : 1;
      let nextIndex = (currentIndex + direction) % typesList.length;
      if (nextIndex < 0) nextIndex = typesList.length - 1;

      const targetType = typesList[nextIndex];
      changeElementType(currentId, targetType);
    }
  };

  const saveHeaderTitleAndAuthor = () => {
    setScreenplay(prev => ({
      ...prev,
      title: headerEditTitle.toUpperCase().trim() || "UNTITLED SCREENPLAY",
      author: headerEditAuthor.trim() || "Writer"
    }));
    setIsEditingHeader(null);
  };

  // AI Pipeline triggers
  const convertDraftToScreenplay = async () => {
    if (!draftText || draftText.trim() === '') {
      setErrorMessage('Please enter dialogue or transcripts into the processor input box first.');
      return;
    }

    setIsFormatting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftText,
          additionalInstructions,
          formatOption,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Server returned an error.');
      }

      if (resData.screenplay) {
        const parsed: Screenplay = resData.screenplay;
        
        const elementsWithIds = parsed.elements.map((el, i) => ({
          ...el,
          id: el.id || `ai-el-${Date.now()}-${i}`
        }));

        const resultScript: Screenplay = {
          title: parsed.title ? parsed.title.toUpperCase() : 'AI GENERATED SCENE',
          author: parsed.author || screenplay.author || 'Writer',
          elements: elementsWithIds
        };

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const hItem: HistoryItem = {
          timestamp,
          title: resultScript.title,
          script: resultScript
        };

        setHistoryList(prev => [hItem, ...prev].slice(0, 10));
        setScreenplay(resultScript);
        setSuccessMessage('AI successfully formatted the script dialog into standards screenplay layout.');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while running dialogue matching. Make sure node process is active.');
    } finally {
      setIsFormatting(false);
    }
  };

  const resetToInitialScr = () => {
    if (confirm('Revert screenplay to setup defaults? Local additions will be replaced.')) {
      setScreenplay(INITIAL_SCRIPT);
      setSuccessMessage('Successfully reverted to default sample script.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Exporters
  const downloadFDX = () => {
    const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });

    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;
    xml += `<FinalDraft DocumentType="Script" Template="Standard Screenplay" Version="4">\n`;
    xml += `  <Content>\n`;
    
    screenplay.elements.forEach((el) => {
      let fdxType = "Action";
      switch (el.type) {
        case 'Scene Heading': fdxType = 'Scene Heading'; break;
        case 'Character': fdxType = 'Character'; break;
        case 'Dialogue': fdxType = 'Dialogue'; break;
        case 'Parenthetical': fdxType = 'Parenthetical'; break;
        case 'Transition': fdxType = 'Transition'; break;
        case 'Shot': fdxType = 'Shot'; break;
        default: fdxType = 'Action';
      }

      xml += `    <Paragraph Type="${fdxType}">\n`;
      xml += `      <Text>${escapeXml(el.text)}</Text>\n`;
      xml += `    </Paragraph>\n`;
    });

    xml += `  </Content>\n`;
    xml += `</FinalDraft>\n`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${screenplay.title.toLowerCase().replace(/\s+/g, '_') || 'script'}.fdx`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Successfully generated Final Draft XML (.fdx) file!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const downloadTxt = () => {
    let output = '';
    output += `${' '.repeat((80 - screenplay.title.length) / 2)}${screenplay.title.toUpperCase()}\n`;
    output += `${' '.repeat((80 - screenplay.author.length - 3) / 2)}by ${screenplay.author}\n\n`;
    output += '='.repeat(80) + '\n\n';

    screenplay.elements.forEach(el => {
      const textVal = el.text;
      switch (el.type) {
        case 'Scene Heading':
          output += `\n${textVal.toUpperCase()}\n\n`;
          break;
        case 'Action':
          output += `${wrapText(textVal, 60, 0)}\n\n`;
          break;
        case 'Character':
          output += `${' '.repeat(22)}${textVal.toUpperCase()}\n`;
          break;
        case 'Parenthetical':
          output += `${' '.repeat(16)}${textVal.startsWith('(') ? textVal : `(${textVal})`}\n`;
          break;
        case 'Dialogue':
          output += `${wrapText(textVal, 35, 10)}\n`;
          break;
        case 'Transition':
          output += `${' '.repeat(Math.max(0, 60 - textVal.length))}${textVal.toUpperCase()}\n\n`;
          break;
        case 'Shot':
          output += `\n${textVal.toUpperCase()}\n\n`;
          break;
      }
    });

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${screenplay.title.toLowerCase().replace(/\s+/g, '_') || 'script'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Successfully exported formatted industry standard text script!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const wrapText = (text: string, maxLen: number, indent: number): string => {
    const words = text.split(/\s+/);
    let lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length + 1 <= maxLen) {
        currentLine += (currentLine === '' ? '' : ' ') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return lines.map(line => ' '.repeat(indent) + line).join('\n');
  };

  const triggerPrint = () => {
    setSuccessMessage('Formatting script into pristine, industry-standard PDF layout. In your printer settings, set "Destination" to "Save as PDF" and uncheck "Headers & Footers".');
    setTimeout(() => {
      window.print();
    }, 350);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  // Extract Scene Headings for left outline lists
  const sceneHeadings = screenplay.elements.filter(el => el.type === 'Scene Heading');

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f10] text-slate-200 overflow-hidden font-sans">
      
      {/* Sleek Header bar */}
      <header className="no-print h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#161618] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <span className="font-semibold tracking-tight text-white flex items-center gap-2">
              SCRIPTFLOW AI 
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest px-1.5 py-0.5 border border-slate-700/60 rounded bg-white/5">Pro</span>
            </span>
          </div>
        </div>

        {/* Header Metadata badge & top integrations */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-xs text-slate-400 font-mono bg-black/30 px-3 py-1.5 rounded border border-white/5">
            PROJECT_ID: FDX_{screenplay.title.replace(/\s+/g, '_').substring(0, 12).toUpperCase() || 'UNTITLED'}
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-white/10 bg-white/5 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Cheatsheet
          </button>

          <button 
            onClick={resetToInitialScr}
            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3.5 py-1.5 rounded text-xs tracking-wide transition-colors border border-white/10 flex items-center gap-1.5"
          >
            <ListRestart className="w-3.5 h-3.5 text-slate-400" />
            Reset
          </button>

          <button 
            onClick={downloadFDX}
            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-2 transition-all border border-white/10 active:scale-[0.98]"
          >
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span>Export Final Draft (.fdx)</span>
          </button>

          <button 
            onClick={triggerPrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>
        </div>
      </header>

      {/* Tri-Pane Grid Main Viewport */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* LEFT ASIDE — Navigation Outline Outline & Stats */}
        <aside className="no-print w-64 border-r border-white/10 bg-[#121214] flex flex-col p-4 shrink-0 overflow-y-auto space-y-6">
          
          {/* Navigation options */}
          <div>
            <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Writer Workspace</h3>
            <ul className="space-y-1">
              <li className="text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-md font-medium border border-blue-500/10 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Screenplay Editor
              </li>
              <li 
                onClick={triggerPrint}
                className="text-xs text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                Export to PDF
              </li>
              <li 
                onClick={downloadTxt}
                className="text-xs text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                Raw Text (.txt)
              </li>
            </ul>
          </div>

          {/* Dynamic Scene Navigator Outline */}
          <div>
            <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2.5 flex justify-between items-center">
              <span>Scene Headings ({sceneHeadings.length})</span>
            </h3>
            
            {sceneHeadings.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic px-1">No scene headings found. Add one on the paper to map output scenes.</p>
            ) : (
              <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                {sceneHeadings.map((scene, i) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      const element = document.getElementById(`scene-element-${scene.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      setActiveElementId(scene.id);
                    }}
                    className="w-full text-left text-[11px] leading-relaxed text-slate-400 hover:text-slate-100 px-2.5 py-1.5 rounded hover:bg-white/5 border-l-2 border-blue-600/60 hover:border-blue-500 pl-3 transition-all truncate block"
                  >
                    {i + 1}. {scene.text || 'UNTITLED SCENE'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Formatting specification panel */}
          <div className="mt-auto p-4 bg-gradient-to-t from-blue-900/10 to-transparent rounded-xl border border-blue-500/20">
            <p className="text-[10px] font-semibold text-blue-300 mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              FDA Formatting Active
            </p>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
              <span>Courier Prime</span>
              <span>12pt Standard</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase mt-1">
              <span>US Letter</span>
              <span>1.5&quot; Margin</span>
            </div>
          </div>
        </aside>

        {/* MIDDLE SCREEN — Dynamic screenplay writing screen */}
        <section className="flex-1 bg-[#1c1c1e] p-6 lg:p-10 flex flex-col items-center overflow-y-auto relative">
          
          {/* Header notification ribbons */}
          <div className="w-full max-w-2xl no-print mb-4 space-y-2">
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-lg bg-red-950/60 border border-red-700/50 text-xs text-red-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                  <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-450 hover:text-white pb-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-2xl no-print bg-[#161618] border border-blue-500/20 p-4 rounded-xl text-xs text-slate-300 space-y-2 mb-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-1.5 text-blue-400">
                    <Info className="w-4 h-4" />
                    Interactive Keyboard Ergonomics
                  </h3>
                  <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Double-click or press any block in the script to enter full WYSIWYG editing mode. Work fast similarly to offline Final Draft:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10.5px] bg-[#0f0f10] p-3 rounded-lg border border-white/5 text-blue-300">
                  <li><span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded mr-1">Tab</span> Cycles text element types sequentially</li>
                  <li><span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded mr-1">Shift + Tab</span> Cycles backwards</li>
                  <li><span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded mr-1">Enter</span> Creates logical continuation block below</li>
                  <li><span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded mr-1">Shift + Enter</span> Manual break-line</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Screenplay mock paper */}
          <div className="script-container w-full max-w-2xl select-text">
            <div className="screenplay-paper w-full p-12 md:p-16 text-black flex flex-col min-h-[297mm] select-none bg-stone-50 rounded-sm">
              
              {/* Cover title area / interactive click edit */}
              <div className="w-full text-center border-b border-gray-200 pb-5 mb-10 flex flex-col items-center group relative no-print">
                {isEditingHeader ? (
                  <div className="w-full max-w-lg space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200 text-left font-sans text-xs">
                    <div className="space-y-1">
                      <label htmlFor="script-title-input" className="text-xs font-bold text-blue-900 block font-sans">Script Title (ALL CAPS)</label>
                      <input
                        id="script-title-input"
                        type="text"
                        value={headerEditTitle}
                        onChange={(e) => setHeaderEditTitle(e.target.value)}
                        className="w-full p-2 bg-white text-black font-semibold font-courier uppercase border border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="script-author-input" className="text-xs font-bold text-blue-900 block font-sans">Screenwriter(s)</label>
                      <input
                        id="script-author-input"
                        type="text"
                        value={headerEditAuthor}
                        onChange={(e) => setHeaderEditAuthor(e.target.value)}
                        className="w-full p-2 bg-white text-black font-courier border border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1 font-sans">
                      <button
                        onClick={() => setIsEditingHeader(null)}
                        className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveHeaderTitleAndAuthor}
                        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold tracking-widest font-courier uppercase text-stone-900">
                      {screenplay.title || "UNTITLED SCREENPLAY"}
                    </h2>
                    <p className="text-stone-500 font-courier italic mt-1 text-xs">
                      Written by {screenplay.author || "Writer"}
                    </p>
                    <button
                      onClick={() => setIsEditingHeader('title')}
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-1 rounded bg-stone-100 hover:bg-blue-50 border border-stone-200 hover:border-blue-200 text-blue-600 transition-all cursor-pointer"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </>
                )}
              </div>

              {/* Printed Title (Visible only when print menu triggers) */}
              <div className="print-only hidden text-center mb-16 uppercase tracking-[0.1em] border-b-2 border-stone-900 pb-8">
                <h1 className="text-2xl font-bold font-courier">{screenplay.title}</h1>
                <p className="text-sm italic font-courier mt-1">by {screenplay.author}</p>
              </div>

              {/* Dialogue script dynamic representation layout */}
              <div className="space-y-[1.125rem] flex-1">
                {screenplay.elements.map((el, idx) => {
                  const isEditing = activeElementId === el.id;
                  const isHovered = hoveredElementId === el.id;

                  let layoutClasses = 'w-full text-stone-900 relative transition-all group/item';
                  
                  switch (el.type) {
                    case 'Scene Heading':
                      layoutClasses += ' uppercase font-bold text-stone-950 mt-6 tracking-wide text-left';
                      break;
                    case 'Action':
                      layoutClasses += ' text-left leading-relaxed text-[#2a2a2c] break-words pr-[5%]';
                      break;
                    case 'Character':
                      layoutClasses += ' pl-[38%] pr-[20%] uppercase text-left font-bold tracking-wide mt-4';
                      break;
                    case 'Parenthetical':
                      layoutClasses += ' pl-[30%] pr-[30%] text-left text-stone-650';
                      break;
                    case 'Dialogue':
                      layoutClasses += ' pl-[24%] pr-[22%] text-left leading-relaxed text-[#1a1a1c] break-words';
                      break;
                    case 'Transition':
                      layoutClasses += ' uppercase text-right tracking-wide pl-[60%] font-bold text-stone-950 pr-4 my-2';
                      break;
                    case 'Shot':
                      layoutClasses += ' uppercase text-left font-bold text-stone-900 mt-4';
                      break;
                  }

                  return (
                    <div
                      key={el.id}
                      id={`scene-element-${el.id}`}
                      className={layoutClasses}
                      onMouseEnter={() => setHoveredElementId(el.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                    >
                      {isEditing ? (
                        <div className="w-full flex items-start gap-2 pt-1.5 border-2 border-blue-500 p-2 rounded bg-blue-50/50 shadow-inner z-10 no-print">
                          
                          <span className="text-[9px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white rounded px-2 py-0.5 select-none self-center">
                            {el.type}
                          </span>

                          <textarea
                            value={el.text}
                            onChange={(e) => updateElementText(el.id, e.target.value)}
                            onKeyDown={(e) => {
                              handleKeyboardEnter(el.id, el.type, el.text, e);
                              handleKeyboardTab(el.id, el.type, e);
                              if (e.key === 'Escape') {
                                setActiveElementId(null);
                              }
                            }}
                            autoFocus
                            placeholder={`Text content for ${el.type}...`}
                            className="flex-1 font-courier font-medium text-[13px] bg-transparent focus:outline-none text-stone-900 min-h-[36px] resize-y p-1"
                          />

                          <button
                            onClick={() => setActiveElementId(null)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-all self-center text-xs px-2.5 py-1 font-sans font-semibold cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setActiveElementId(el.id)}
                          className={`cursor-pointer min-h-[1.125rem] hover:bg-stone-100 rounded px-1 -mx-1 border border-dashed border-transparent hover:border-gray-200 relative ${
                            el.type === 'Parenthetical' ? 'italic' : ''
                          }`}
                        >
                          {el.text.trim() === '' ? (
                            <span className="text-gray-300 italic text-xs font-sans">[Empty {el.type}]</span>
                          ) : (
                            el.text
                          )}
                        </div>
                      )}

                      {/* Element Type Quick Action Controls Badge on Hover */}
                      {isHovered && !isEditing && (
                        <div className="no-print absolute -top-9 z-20 left-4 bg-slate-900 border border-white/10 text-white rounded-lg p-1.5 shadow-xl flex items-center gap-1 select-none">
                          
                          <select
                            value={el.type}
                            onChange={(e) => changeElementType(el.id, e.target.value as ScreenplayElementType)}
                            className="bg-slate-950 text-slate-100 border-none rounded py-0.5 px-2 text-[10px] font-sans font-semibold outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Scene Heading">Scene Heading</option>
                            <option value="Action">Action</option>
                            <option value="Character">Character</option>
                            <option value="Dialogue">Dialogue</option>
                            <option value="Parenthetical">Parenthetical</option>
                            <option value="Transition">Transition</option>
                            <option value="Shot">Shot</option>
                          </select>

                          <button
                            onClick={() => insertElementBelow(el.id, 'Action')}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Insert Action element below"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={idx === 0}
                            onClick={() => moveElement(el.id, 'up')}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={idx === screenplay.elements.length - 1}
                            onClick={() => moveElement(el.id, 'down')}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteElement(el.id)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                            title="Delete element"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom control adding helper */}
              <div className="no-print mt-10 pt-6 border-t border-dashed border-stone-200 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    const lastEl = screenplay.elements[screenplay.elements.length - 1];
                    insertElementBelow(lastEl?.id || 'empty', 'Scene Heading');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-[11px] font-semibold text-stone-700 font-sans transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-stone-550" />
                  + Scene Heading
                </button>

                <button
                  onClick={() => {
                    const lastEl = screenplay.elements[screenplay.elements.length - 1];
                    insertElementBelow(lastEl?.id || 'empty', 'Action');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-[11px] font-semibold text-stone-700 font-sans transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-stone-550" />
                  + Action description
                </button>

                <button
                  onClick={() => {
                    const lastEl = screenplay.elements[screenplay.elements.length - 1];
                    insertElementBelow(lastEl?.id || 'empty', 'Character');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-[11px] font-semibold text-stone-700 font-sans transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-stone-550" />
                  + Dialogue block
                </button>
              </div>

              {/* Bottom end marker */}
              <div className="text-center font-courier uppercase mt-12 text-xs opacity-45 select-none tracking-[0.2em] font-bold text-stone-650">
                THE END
              </div>

            </div>
          </div>
        </section>

        {/* RIGHT ASIDE — Dialogue Processor Interface */}
        <aside className="no-print w-80 bg-[#161618] border-l border-white/10 flex flex-col shrink-0 overflow-y-auto">
          
          <div className="p-4 border-b border-white/5 bg-blue-600/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Dialogue AI Processor
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Input messy transcripts or notes to generate screenplays.
            </p>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
            
            {/* Quick Template Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                <span>Select dialogue preset</span>
              </label>
              <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                {SAMPLE_DRAFTS.map((draftItem) => (
                  <button
                    key={draftItem.id}
                    onClick={() => loadSampleDraft(draftItem.id)}
                    className="w-full text-left p-1.5 rounded bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[11px] text-slate-300 transition-colors flex justify-between items-center group cursor-pointer"
                  >
                    <span className="truncate max-w-[85%] font-medium group-hover:text-white">{draftItem.name}</span>
                    <BookOpen className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Processor Text Input */}
            <div className="flex-1 flex flex-col min-h-[160px]">
              <label htmlFor="raw-dialogue-textarea" className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Raw Dialogue Text / Transcription
              </label>
              <textarea
                id="raw-dialogue-textarea"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Hannah: I think the server is fried.&#10;Marcus: Did you reset the power block?&#10;Hannah: Yes, smoking wires..."
                className="flex-1 w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60 leading-relaxed resize-none"
              />
            </div>

            {/* AI Control Parameters */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="run-type-select" className="text-[10.5px] uppercase font-semibold text-slate-500 block">AI Formatting Option</label>
                <select
                  id="run-type-select"
                  value={formatOption}
                  onChange={(e) => setFormatOption(e.target.value)}
                  className="w-full p-2 bg-black/60 border border-white/10 text-xs text-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="Adapt raw notes precisely into clean script elements">Adapt notes precisely</option>
                  <option value="Convert messy Zoom voice recording transcripts into standard cinematic rhythm">Transform Zoom transcripts</option>
                  <option value="Add detailed physical gestures, physical environment actions, and parentheticals">Enrich with behaviors & context</option>
                  <option value="Convert casual classic literature dialogue into professional contemporary screenplay format">Contemporary Screenplay style</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-ai-prompt" className="text-[10.5px] uppercase font-semibold text-slate-500 block">Custom Adjustment Directives</label>
                <input
                  id="custom-ai-prompt"
                  type="text"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. 'Set at INT. COFFEE SHOP', 'Angry'"
                  className="w-full p-2 bg-black/60 border border-white/10 text-xs text-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Format CTA Button */}
            <button
              onClick={convertDraftToScreenplay}
              disabled={isFormatting}
              className="w-full py-2.5 bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase rounded-lg tracking-wider transition-all disabled:opacity-40 select-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFormatting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Format & Insert into Script
                </>
              )}
            </button>

            {/* Saved Version Backups */}
            {historyList.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Revision History ({historyList.length})
                </h4>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {historyList.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setScreenplay(item.script);
                        setSuccessMessage(`Restored version: "${item.title}"`);
                        setTimeout(() => setSuccessMessage(null), 3500);
                      }}
                      className="w-full text-left p-1.5 rounded bg-black/25 hover:bg-white/5 border border-white/5 text-[10px] text-slate-300 transition-colors flex justify-between items-center cursor-pointer"
                    >
                      <span className="truncate max-w-[70%] font-medium text-slate-300">{item.title}</span>
                      <span className="font-mono text-[9px] text-slate-500">{item.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Green status box */}
            <div className="bg-black/20 rounded-lg p-3 border border-white/5 mt-auto">
              <h4 className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Final Draft Sync
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Ready for export
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                All Screenplay elements, Scene Headings, Characters, and Extensions are automatically mapped inside the FDX hierarchy.
              </p>
            </div>

          </div>

        </aside>

      </main>

      {/* FOOTER */}
      <footer className="no-print h-8 bg-[#0a0a0b] border-t border-white/10 px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none shrink-0">
        <div>STATUS: {isFormatting ? 'PROCESSING_AI_ENGINE_STATE' : 'LIVE_READY'}</div>
        <div>ACTIVE_SCRIPT: {screenplay.title || 'NONE'}</div>
        <div>SCREENPLAY_v4.20</div>
      </footer>

    </div>
  );
}
