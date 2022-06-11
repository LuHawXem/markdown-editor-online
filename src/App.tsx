import React, { useState, useLayoutEffect, ChangeEvent, KeyboardEvent } from 'react';
//@ts-ignore
import Prism from 'prismjs';
import './App.scss';
import 'github-markdown-css/github-markdown.css';

const md = require('markdown-it')();
const emoji = require('markdown-it-emoji');
md.use(emoji);

const isMobile = /android|Adr|iPhone|iPod|iPad/gi.test(navigator.userAgent) || /android|Adr|iPhone|iPod|iPad/gi.test(navigator.appVersion)

function App() {
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  useLayoutEffect(() => {
    Prism.highlightAll();
  })

  const listenValueChange = (element?:HTMLTextAreaElement) => {
    const ele = element ? element : document.getElementById('input') as HTMLTextAreaElement;
    setValue(ele.value);
    const str = md.render(ele.value) as string;
    setData(str);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    let ele = document.getElementById('input') as HTMLTextAreaElement;
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ele.selectionStart;
      const end = ele.selectionEnd;
      let str;
      if (start === end) {
        str = ele.value.slice(0, ele.selectionEnd);
        str += '  ';
        str += ele.value.slice(ele.selectionEnd);
        ele.value = str;
        ele.selectionEnd = end + 2;
        ele.selectionStart = end + 2;
      } else {
        str = ele.value.slice(0, ele.selectionStart);
        str += '  ';
        str += ele.value.slice(ele.selectionEnd);
        ele.value = str;
        ele.selectionEnd = start + 2;
        ele.selectionStart = start + 2;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = ele.selectionStart;
      const end = ele.selectionEnd;
      let str;
      if (start === end) {
        str = ele.value.slice(0, ele.selectionEnd);
        str += '\n';
        str += ele.value.slice(ele.selectionEnd);
        ele.value = str;
        ele.selectionEnd = end + 1;
        ele.selectionStart = end + 1;
      } else {
        str = ele.value.slice(0, ele.selectionStart);
        str += '\n';
        str += ele.value.slice(ele.selectionEnd);
        ele.value = str;
        ele.selectionEnd = start + 1;
        ele.selectionStart = start + 1;
      }
    }
    listenValueChange(ele);
  }

  const upload = (e:ChangeEvent<HTMLInputElement>) => {
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
    <div className={`App ${isMobile ? 'Mobile': ''}`}>
      <div className="ViewArea markdown-body" dangerouslySetInnerHTML={{__html: data}}/>
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
