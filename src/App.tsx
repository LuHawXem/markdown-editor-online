import React, { useState, useLayoutEffect, ChangeEvent, KeyboardEvent } from 'react';
//@ts-ignore
import Prism from 'prismjs';
import './App.scss';
import 'github-markdown-css/github-markdown.css';

const md = require('markdown-it')();
const emoji = require('markdown-it-emoji');
md.use(emoji);

const isMobile = /android|Adr|iPhone|iPod|iPad/gi.test(navigator.userAgent) || /android|Adr|iPhone|iPod|iPad/gi.test(navigator.appVersion)

function replaceInput(ele: HTMLTextAreaElement, substr: string, step: number) {
  const start = ele.selectionStart;
  const end = ele.selectionEnd;
  let str;
  if (start === end) {
    str = ele.value.slice(0, ele.selectionEnd);
    str += substr;
    str += ele.value.slice(ele.selectionEnd);
    ele.value = str;
    ele.selectionEnd = end + step;
    ele.selectionStart = end + step;
  } else {
    str = ele.value.slice(0, ele.selectionStart);
    str += substr;
    str += ele.value.slice(ele.selectionEnd);
    ele.value = str;
    ele.selectionEnd = start + step;
    ele.selectionStart = start + step;
  }
}

function getFrontSpaceNum(ele: HTMLTextAreaElement): number {
  const end = ele.selectionStart > ele.selectionEnd ? ele.selectionEnd : ele.selectionStart;
  let str;
  const substr = ele.value.slice(0, end);
  const breakIdx = substr.lastIndexOf('\n') + 1;
  const startLine = substr.slice(breakIdx);
  const spaceNum = startLine.length - startLine.trimStart().length;
  return spaceNum;
}

function App() {
  const timeline: Array<string> = [];
  let cur = -1;
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const [combine, setCombine] = useState(false);
  useLayoutEffect(() => {
    Prism.highlightAll();
  })

  const listenValueChange = (element?: HTMLTextAreaElement) => {
    const ele = element ? element : document.getElementById('input') as HTMLTextAreaElement;
    timeline.push(ele.value);
    cur++;
    setValue(ele.value);
    const str = md.render(ele.value) as string;
    setData(str);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const syntaxObj = {
      "[": "[]",
      "(": "()",
      "'": "''",
      '"': '""'
    }

    let ele = document.getElementById('input') as HTMLTextAreaElement;
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        replaceInput(ele, '  ', 2);
        break;
      case 'Enter':
        e.preventDefault();
        replaceInput(ele, `\n${' '.repeat(getFrontSpaceNum(ele))}`, 1 + getFrontSpaceNum(ele));
        break;
      case '{':
        e.preventDefault();
        replaceInput(ele, `{\n${' '.repeat(getFrontSpaceNum(ele))}}`, 2 + getFrontSpaceNum(ele));
        break;
      case '[':
      case '(':
      case '"':
      case "'":
        e.preventDefault();
        replaceInput(ele, syntaxObj[e.key], 1);
        break;
      case "Control":
        setCombine(true);
        break;
      case "Z":
        if (combine) {
          if (cur >= 0) cur--;
          else break;
          setValue(timeline[cur]);
          const str = md.render(timeline[cur]) as string;
          setData(str);
          setCombine(false);
        }
        break;
    }
    listenValueChange(ele);
  }

  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    let file = files?.[0];
    if (!file || !/^(.+)\.md$/.test(file.name)) return;
    file.text().then(r => {
      setValue(r as string);
      setData(md.render(r) as string);
    })
  }

  const uploadFile = () => {
    let ele = document.createElement('input');
    ele.type = 'file';
    ele.accept = '.md';
    ele.style.display = 'none';
    ele.addEventListener('change', (e) => upload(e as unknown as ChangeEvent<HTMLInputElement>))
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);
  }

  const downloadFile = () => {
    let link = document.createElement('a');
    link.download = `${value.slice(0, 5)}.md`;
    link.style.display = 'none';
    let blob = new Blob([value]);
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className={`App ${isMobile ? 'Mobile' : ''}`}>
      <div className="ViewArea markdown-body" dangerouslySetInnerHTML={{ __html: data }} />
      <div className="InputArea">
        <textarea
          id="input"
          onChange={() => listenValueChange()}
          onKeyDown={(e) => onKeyDown(e)}
          value={value}
        />
      </div>
      <div className="OpArea">
        <button className="Btn" onClick={() => uploadFile()}>上传文件</button>
        <button className="Btn" onClick={() => downloadFile()}>保存文件</button>
      </div>
    </div>
  );
}

export default App;
