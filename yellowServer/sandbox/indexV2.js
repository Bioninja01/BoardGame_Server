const fs = require('fs');
const { ipcRenderer, remote, clipboard } = require('electron');
const { electron } = require('process');

// Collection of usefull function Developer should use for common tasks.
class Dev {
  static patter = RegExp(
    '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
  );
  static id(id) {
    let element = document.getElementById(id);
    return element;
  }
  static clazz(className, index = 0, element = document) {
    let seletedElement = element.getElementsByClassName(className)[index];
    return seletedElement;
  }
  static uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  static checkForId(text) {
    return Dev.patter.test(text);
  }
  static getUuid(element) {
    let classList = element.classList;
    for (let i in classList) {
      let clazz = classList[i];
      if (Dev.checkForId(clazz)) {
        return clazz;
      }
    }
  }
  static getParentWithClass(element, className) {
    if (element == undefined || element == null) {
      return null;
    }
    for (let index in element.classList) {
      if (element.classList[index] == className) {
        return element;
      }
    }
    return Dev.getParentWithClass(element.parentElement, className);
  }
  static text_noWhiteSpace(text) {
    return text.replace(/\s+/g, '');
  }
  static html2Element(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }
  static insertText(text) {
    var textNode = document.createTextNode(text);
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(textNode);
        sel.collapseToEnd(textNode, 0);
      }
    }
  }
}
class GUI_Util {
  static callDataObjTrigger(data) {
    switch (data.trigger.length) {
      case 0:
        data.trigger();
        break;
      case 1:
        data.trigger(data.arg[0]);
        break;
      case 2:
        data.trigger(data.arg[0], data.arg[1]);
        break;
      case 3:
        data.trigger(data.arg[0], data.arg[1], data.arg[2]);
        break;
      case 4:
        data.trigger(data.arg[0], data.arg[1], data.arg[2], data.arg[3]);
        break;
      case 5:
        data.trigger(
          data.arg[0],
          data.arg[1],
          data.arg[2],
          data.arg[3],
          data.arg[4]
        );
        break;
    }
  }
  static buildMenu(dataList) {
    var ul = document.createElement('ul');
    for (let data in dataList) {
      data = dataList[data];
      let li = document.createElement('li');
      li.setAttribute('style', 'user-select: none;');
      li.innerHTML = data.text;
      if (data.sub != null || data.sub != undefined) {
        li.classList.add('subMenu');
        let new_ul = GUI_Util.buildMenu(data.sub);
        li.appendChild(new_ul);
      } else if (data.filter != null || data.filter != undefined) {
        li.classList.add('subMenu');
        let new_ul = GUI_Util.buildMenu_filterList(data.filter);
        li.appendChild(new_ul);
      } else {
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          GUI_Util.callDataObjTrigger(data);
        });
      }
      ul.append(li);
    }
    return ul;
  }
  static buildMenu_filterList(dataList) {
    let ul = document.createElement('ul');
    let input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search...';
    let new_ul = document.createElement('ul');
    new_ul.classList.add('filterList');
    for (let data in dataList) {
      data = dataList[data];
      let li = document.createElement('li');
      li.setAttribute('style', 'user-select: none;');
      li.innerHTML = data.text;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        GUI_Util.callDataObjTrigger(data);
      });
      new_ul.append(li);
    }
    input.addEventListener('input', function (e) {
      Ux_Actions.filterList(input.value, new_ul);
    });
    ul.append(input);
    ul.append(new_ul);
    return ul;
  }
  static buildMenu_List(dataList) {
    let ul = document.createElement('ul');
    for (let data in dataList) {
      data = dataList[data];
      let li = document.createElement('li');
      li.setAttribute('style', 'user-select: none;');
      li.innerHTML = data.text;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        GUI_Util.callDataObjTrigger(data);
      });
      ul.append(li);
    }
    return ul;
  }
  static getKeyWordData(list) {
    let filter = [];
    for (let i = 0; i < list.length; i++) {
      let value = list[i];
      var obj = new MenueItemData(value, function () {
        insertText(value);
      });
      filter.push(obj);
    }
    return filter;
  }
}
class Ux_Actions {
  static addToSubject(input, subject) {
    var lookupTable = subject.lookuptable;
    lookupTable[Dev.uuid()] = input.value;
    subject.brodcast();
  }
  static appendFromSelection(element, ul, subject) {
    let li = document.createElement('li');
    let id = element.options[element.selectedIndex].className;
    li.innerHTML = element.options[element.selectedIndex].value;
    if (id != 'newItem') {
      li.classList.add(id);
      li.onkeyup = Ux_Actions.newListItem_uuid;
      li.subject = this.subject;
      li.style.userSelect = 'none';
      li.setAttribute('contenteditable', 'false');
      let childern = ul.children;
      for (let i in childern) {
        let child = childern[i];
        if (child.className == id) {
          return;
        }
      }
    } else {
      li.classList.add(Dev.uuid());
      li.onkeyup = Ux_Actions.newListItem_uuid;
      li.subject = subject;
    }
    let actionButton = new ActionButton(['delete']);
    actionButton.buttons[0].onclick = function (e) {
      let id = element.className;
      let elements = document.getElementsByClassName(id);
      console.log(element.className);
      while (elements.length > 0) {
        elements[0].remove();
      }
      let lookupTable = subject.lookuptable;
      delete lookupTable[id];
    };
    li.append(actionButton.element);
    ul.prepend(li);
  }
  static appendElement(element) {
    let elementToAppend = element.cloneNode(true);
    elementToAppend.id = Dev.uuid();
    element.parentNode.insertBefore(elementToAppend, element.nextSibling);
    return elementToAppend;
  }
  static appendChapter(element, cs) {
    let clone = Ux_Actions.appendElement(element);
    clone.id = Dev.uuid();
    cs.addChapter(clone);
  }
  static prependElement(element) {
    let elementToAppend = element.cloneNode(true);
    elementToAppend.id = Dev.uuid();
    element.parentNode.insertBefore(elementToAppend, element);
  }
  static cloneElement(element) {
    let clone = element.cloneNode(true);
    clone.id = Dev.uuid();
    return clone;
  }
  static deleteElement(element) {
    var nextSibling = element.nextElementSibling;
    var previousSibling = element.previousElementSibling;
    if (element.className.includes('container')) {
      let element2Remove = element;
      element = nextSibling;
      element2Remove.remove();
      ContextMenu_Controller.populateData(nextSibling);
    }
    if (nextSibling != null && nextSibling.className != element.className) {
      if (
        previousSibling != null &&
        previousSibling.className != element.className
      ) {
        return;
      }
    }
    let element2Remove = element;
    element = nextSibling;
    element2Remove.remove();
    ContextMenu_Controller.populateData(nextSibling);
  }
  static switchElement(element) {
    var childCount = 0;

    let value = element.getElementsByClassName('start')[0].value;
    while (element.childElementCount > 0) {
      element.removeChild(element.children[0]);
      childCount++;
    }

    var input = document.createElement('input');
    input.classList.add('completion_select');
    input.setAttribute('onchange', "this.setAttribute('value', this.value);");
    input.setAttribute('value', value.toString());
    input.setAttribute('style', 'width: 50px;');
    input.setAttribute('type', 'text');

    var clone = input.cloneNode(true);
    var clone2 = input.cloneNode(true);
    clone.classList.add('start');
    clone2.classList.add('end');

    var span1 = document.createElement('span');
    span1.innerHTML = 'Start ';
    span1.append(clone);

    var seperator = document.createElement('span');
    seperator.innerHTML = ' - ';

    var span2 = document.createElement('span');
    span2.innerHTML = 'End ';
    span2.append(clone2);

    if (childCount == 1) {
      element.append(span1);
      element.append(seperator);
      element.append(span2);
    } else {
      element.append(span1);
    }
  }
  static sublist() {
    var ol = document.createElement('ol');
    var li = document.createElement('li');
    li.classList.add('subItem');
    ol.append(li);
    li.innerHTML = 'N/A';
    ol.classList.add('step_description_subSteps');
    ol.setAttribute('style', ' list-style-type:lower-alpha;');
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(ol);
      }
    }
  }
  static embeadImg() {
    ipcRenderer.send('open-file-dialog', {});
  }
  static getJson() {
    ipcRenderer.send('open-jsonfile-dialog', {});
  }
  static filterList(text, ul) {
    var children = ul.children;
    for (let child = 0; child < children.length; child++) {
      let childElement = children[child];
      if (!childElement.innerHTML.includes(text)) {
        childElement.style.display = 'none';
      } else {
        childElement.style.display = 'block';
      }
    }
  }
  static appendTemp(name, element) {
    var temp = getTempletElement(name);
    element.parentNode.insertBefore(temp, element.nextSibling);
  }
  static prependTemp(name, element) {
    var temp = getTempletElement(name);
    element.parentNode.insertBefore(temp, element);
  }
  static newListItem_uuid(e) {
    if (e.key == 'Enter') {
      var newElement = window.getSelection().anchorNode;
      if (newElement.nodeName == 'LI') {
        newElement.className = Dev.uuid();
      } else {
        newElement = newElement.parentElement;
        newElement.className = Dev.uuid();
      }
    }
    let subject = this.subject;
    var lookupTable = subject.lookuptable;
    var children = e.target.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.className == '') {
        child.className = Dev.uuid();
        lookupTable[child.className] = child.innerText;
      } else {
        lookupTable[child.className] = child.innerText;
      }
    }
    subject.brodcast();
  }
}
class DocumentLoad {
  static populate_Subject(subject, className) {
    let components = document.getElementsByClassName(className);
    for (let i = 0; i < components.length; i++) {
      let component = components[i];
      for (let j = 0; j < component.children.length; j++) {
        let child = component.children[j];
        let id = child.className;
        let text = child.innerHTML;
        subject.lookuptable[id] = text;
      }
    }
    subject.brodcast();
    return subject;
  }
  static setup_Subjects(subject, className) {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      const observer = new Observer(element);
      subject.addObserver(observer);
    }
  }
  static setup_Subjects_SelectObserver(subject, className) {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      const observer = new SelectObserver(element);
      subject.addObserver(observer);
    }
  }
  static setUp_listeners_PredictiveText(element, pt) {
    element.onmousedown = function (e) {
      let predictiveText = element.getElementsByClassName('predictiveText');
      if (predictiveText.length == 0) {
        pt.attach(this);
        pt.autoComplete();
      }
    };
    element.onclick = function (e) {
      pt.autoComplete();
    };
    element.onkeyup = function (e) {
      pt.autoComplete();
    };
  }
  static addEvenetListernToTabbButtons() {
    var tab = document.getElementsByClassName('tab')[0];
    var buttons = tab.children[0].children;
    var sib = tab.nextElementSibling;
    var sections = [];
    for (let i = 0; i < buttons.length; i++) {
      sections.push(sib);
      sib = sib.nextElementSibling;
    }
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.addEventListener('click', (e) => {
        for (let index = 0; index < buttons.length; index++) {
          const element = buttons[index];
          element.classList.remove('activeTab');
        }
        button.classList.add('activeTab');
        for (let j = 0; j < sections.length; j++) {
          if (j == i) {
            sections[i].style.display = 'block';
          } else {
            sections[j].style.display = 'none';
          }
        }
      });
    }
  }
}
class TreeView {
  static metaData_id = 'treeViewData';

  static StepBeforer(treeView, newStepElement, stepElement) {
    stepElement.parentNode.insertBefore(newStepElement, stepElement);
    treeView.addStepBeforerStep(newStepElement, stepElement);
    treeView.display();
  }
  static StepAfter(treeView, newStepElement, stepElement) {
    stepElement.parentNode.insertBefore(newStepElement, stepElement);
    stepElement.parentNode.insertBefore(stepElement, newStepElement);
    treeView.addStepAfterStep(newStepElement, stepElement);
    treeView.display();
  }
  static populate_chapterData(treeView) {
    let treeViewData = parse_metaData(TreeView.metaData_id);
    if (treeViewData == null) {
      return;
    }
    for (let i = 0; i < treeViewData.length; i++) {
      let chapterData = treeViewData[i];
      if (chapterData == null) {
        continue;
      }
      let element = document.getElementById(chapterData.id);
      chapterData.element = element;
      let setps = chapterData.steps;
      for (let j = 0; j < setps.length; j++) {
        let setpData = setps[j];
        if (setpData == null) {
          continue;
        }
        let setpElement = document.getElementById(setpData.id);
        setpData.element = setpElement;
      }
    }
    treeView.chapters = treeViewData;
  }
  static delete_chapterData(treeView, chapterElement) {
    var nextSibling = chapterElement.nextElementSibling;
    var previousSibling = chapterElement.previousElementSibling;
    if (
      nextSibling != null &&
      nextSibling.className != chapterElement.className
    ) {
      if (
        previousSibling != null &&
        previousSibling.className != chapterElement.className
      ) {
        return;
      }
    }

    let id = chapterElement.id;
    for (let i = 0; i < treeView.chapters.length; i++) {
      let chapterData = treeView.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == id) {
        let setps = chapterData.steps;
        for (let j = 0; j < setps.length; j++) {
          let setpData = setps[j];
          if (setpData == null) {
            continue;
          }
          setpData.element.remove();
        }
        chapterData.element.remove();
        treeView.chapters.splice(i, 1);
      }
    }
    if (chapterElement) {
      chapterElement.remove();
    }
    treeView.display();
  }
  constructor() {
    this.element = document.getElementById('treeView');
    this.chapters = [];
  }
  addChapter(chapterElement) {
    let name = Dev.clazz('moduleName', 0, chapterElement).value;
    let chapterData = {
      id: chapterElement.id,
      chapterName: name,
      element: chapterElement,
      steps: [],
    };
    for (let i in this.chapters) {
      let data = this.chapters[i];
      if (data == null) {
        continue;
      }
      if (data.id == chapterData.id) {
        return;
      }
    }
    this.chapters.push(chapterData);
  }
  addStepToChapter(stepElement) {
    let stepNumber = Dev.clazz('taskOrder_stepNumber', 0, stepElement).value;
    let stepData = {
      id: stepElement.id,
      number: stepNumber,
      element: stepElement,
    };
    let id = stepElement.id;
    let chapterId = Dev.getUuid(stepElement);
    for (let i in this.chapters) {
      let chapterData = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == chapterId) {
        chapterData.steps.push(stepData);
      }
    }
  }
  addStepAfterStep(newStepElement, stepElement) {
    let stepNumber = Dev.clazz('taskOrder_stepNumber', 0, stepElement).value;
    let stepData = {
      id: newStepElement.id,
      number: stepNumber,
      element: newStepElement,
    };
    let chapterId = Dev.getUuid(stepElement);
    for (let i in this.chapters) {
      let chapterData = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == chapterId) {
        for (let j = 0; j < chapterData.steps.length; j++) {
          let data = chapterData.steps[j];
          if (data == null) {
            continue;
          }
          if (data.id == stepElement.id) {
            chapterData.steps.splice(j + 1, 0, stepData);
            return;
          }
        }
      }
    }
  }
  addStepBeforerStep(newStepElement, stepElement) {
    let stepNumber = Dev.clazz('taskOrder_stepNumber', 0, stepElement).value;
    let stepData = {
      id: newStepElement.id,
      number: stepNumber,
      element: newStepElement,
    };
    let chapterId = Dev.getUuid(stepElement);
    for (let i in this.chapters) {
      let chapterData = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == chapterId) {
        for (let j = 0; j < chapterData.steps.length; j++) {
          let data = chapterData.steps[j];
          if (data == null) {
            continue;
          }
          if (data.id == stepElement.id) {
            chapterData.steps.splice(j, 0, stepData);
            return;
          }
        }
      }
    }
  }
  updateStepName(stepElement) {
    let stepNumber = Dev.clazz('taskOrder_stepNumber', 0, stepElement).value;
    let stepData = {
      id: stepElement.id,
      number: stepNumber,
      element: stepElement,
    };
    let id = stepElement.id;
    let chapterId = Dev.getUuid(stepElement);
    for (let i in this.chapters) {
      let chapterData = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == chapterId) {
        for (let j = 0; j < chapterData.steps.length; j++) {
          let data = chapterData.steps[j];
          if (data == null) {
            continue;
          }
          if (data.id == stepData.id) {
            data.number = stepData.number;
            return;
          }
        }
      }
    }
  }
  updateChapterName(id, name) {
    for (let i = 0; i < this.chapters.length; i++) {
      let chapter = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapter.id == id) {
        chapter.chapterName = name;
      }
    }
  }
  removeStep(stepElement) {
    let chapterId = Dev.getUuid(stepElement);
    for (let i in this.chapters) {
      let chapterData = this.chapters[i];
      if (chapterData == null) {
        continue;
      }
      if (chapterData.id == chapterId) {
        for (let j = 0; j < chapterData.steps.length; j++) {
          let data = chapterData.steps[j];
          if (data == null) {
            continue;
          }
          if (data.id == stepElement.id) {
            chapterData.steps.splice(j, 1);
            // delete chapterData.steps[j];
            this.display();
            return;
          }
        }
      }
    }
  }
  display() {
    let children = this.element;
    let div = document.createElement('div');
    for (let i in this.chapters) {
      let chapter = this.chapters[i];
      if (chapter == null) {
        continue;
      }
      let li = document.createElement('li');
      li.style.position = 'relative';
      li.classList.add(chapter.id);
      if (chapter.caret != undefined) {
        li.innerHTML =
          "<span class='caret caret-down'>" + chapter.chapterName + '</span>';
      } else {
        li.innerHTML = "<span class='caret'>" + chapter.chapterName + '</span>';
      }
      li.firstChild.addEventListener('click', function () {
        li.querySelector('.nested').classList.toggle('active');
        li.firstChild.classList.toggle('caret-down');
        if (chapter.caret == undefined) {
          chapter.caret = 'caret-down';
        } else {
          chapter.caret = undefined;
        }
      });
      if (chapter.steps) {
        let ul = document.createElement('ul');
        ul.classList.add('nested');
        if (chapter.caret != undefined) {
          ul.classList.add('active');
        }
        for (let j in chapter.steps) {
          let step = chapter.steps[j];
          let li_step = document.createElement('li');

          if (step == null) {
            continue;
          }
          li_step.innerHTML =
            "<a href='#" + step.element.id + "'>" + step.number + '</a>';

          // li_step.innerHTML = step.number;
          li_step.classList.add(step.id);
          let actionButton1 = new ActionButton(['eye']);
          actionButton1.buttons[0].onclick = function (e) {
            let element = document.getElementById(li_step.className);
            if (element.style.display == 'none') {
              element.style.display = 'block';
            } else {
              element.style.display = 'none';
              actionButton1.buttons[0];
            }
            actionButton1.buttons[0].firstChild.classList.toggle('fa-eye');
            actionButton1.buttons[0].firstChild.classList.toggle(
              'fa-eye-slash'
            );
          };
          li_step.append(actionButton1.element);
          actionButton1.element.children[0].setAttribute(
            'style',
            'visibility: visible;'
          );
          ul.appendChild(li_step);
          li.appendChild(ul);
        }
      }
      div.append(li);
    }
    this.element.innerHTML = '';
    this.element.append(div);
    return div;
  }
}
class PredictiveText {
  static html = `<ul class="predictiveText" contenteditable="false">
                    <li style="user-select: none; display: none;">data</li>
                  </ul>`;
  constructor() {
    this.elemnet = Dev.html2Element(PredictiveText.html);
  }
  populateList(keyWords) {
    let ul = this.elemnet;
    ul.innerHTML = '';
    for (let i = 0; i < keyWords.length; i++) {
      let text = keyWords[i];
      let li = document.createElement('li');
      li.onclick = function () {
        var selection, range;
        if (window.getSelection) {
          selection = window.getSelection();
          if (selection.getRangeAt && selection.rangeCount) {
            range = getSeletedWord(selection);
            let word = Dev.text_noWhiteSpace(range.toString());
            Dev.insertText(text);
          }
        }
      };
      li.style.userSelect = 'none';
      li.innerHTML = text;
      ul.append(li);
    }
  }
  attach(element) {
    element.append(this.elemnet);
  }
  autoComplete() {
    var selection, range;
    if (window.getSelection) {
      selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        range = getSeletedWord(selection);
        let word = Dev.text_noWhiteSpace(range.toString());
        range.setStart(selection.anchorNode, range.oldStartOffset);
        range.setEnd(selection.anchorNode, range.oldEndOffset);
        Ux_Actions.filterList(word, this.elemnet);
      }
    }
  }
}
class ObserversList {
  constructor() {
    this.observers = [];
  }
  add(observer) {
    return this.observers.push(observer);
  }
  get(index) {
    if (typeof index !== number) {
      console.warn('the index passed in to getObserver is not a number');
      return;
    }
    return this.observers[index];
  }
  removeAt(index) {
    this.observers.splice(index, 1);
  }
  count() {
    return this.observers.length;
  }
  indexOf(observer, startIndex = 0) {
    let currentIndex = startIndex;

    while (currentIndex < this.observers.length) {
      if (this.observers[currentIndex] === observer) {
        return currentIndex;
      }
      currentIndex++;
    }

    return -1;
  }
  notifyAll(data) {
    const totalObservers = this.observers.length;
    for (let index = 0; index < totalObservers; index++) {
      this.observers[index].update(data);
    }
  }
}
class Subject {
  static populate_lookupTable(subject, id) {
    let subjectData = parse_metaData(id);
    if (subjectData == null) {
      subject.lookuptable = {};
    } else {
      subject.lookuptable = subjectData;
    }
    subject.brodcast();
  }
  constructor() {
    this.lookuptable = {};
    this.observers = new ObserversList();
  }
  brodcast() {
    this.observers.notifyAll(this.lookuptable);
  }
  add(item) {
    if (item.key in this.lookuptable) {
      return false;
    } else {
      this.lookuptable.put(item.key, item);
      this.brodcast();
      return true;
    }
  }
  addObserver(observer) {
    this.observers.add(observer);
    observer.subject = this;
  }
  removeAt(index) {
    this.data.splice(index, 1);
    this.brodcast();
  }
}
class Observer {
  constructor(element) {
    this.list_element = element;
  }
  update(lookuptable) {
    for (let id in lookuptable) {
      let element = this.list_element.getElementsByClassName(id)[0];
      if (element) {
      } else {
        element = document.createElement('li');
        element.classList.add(id);
        this.list_element.append(element);
      }
      element.innerHTML = lookuptable[id];
      let actionButton = new ActionButton(['delete']);
      let subject = this.subject;
      element.append(actionButton.element);
      actionButton.buttons[0].onclick = function (e) {
        let id = element.className;
        let elements = document.getElementsByClassName(id);
        console.log(element.className);
        while (elements.length > 0) {
          elements[0].remove();
        }
        let lookupTable = subject.lookuptable;
        delete lookupTable[id];
      };
    }
  }
}
class SelectObserver extends Observer {
  constructor(element, ul) {
    super(element);
    this.list = ul;
  }
  update(lookuptable) {
    for (let id in lookuptable) {
      let element = this.list_element.getElementsByClassName(id)[0];
      if (element) {
      } else {
        element = document.createElement('option');
        element.classList.add(id);
        this.list_element.append(element);
      }
      element.innerHTML = lookuptable[id];
      element.value = lookuptable[id];
    }
  }
}
class ElementDragger {
  self = this;
  static dragElement = null;
  static active = false;
  static dragClassList = ['contextMenu'];
  static mosuseData = {};
  static start(e) {
    e.preventDefault();
    for (let index in ElementDragger.dragClassList) {
      let className = ElementDragger.dragClassList[index];
      let target = Dev.getParentWithClass(e.target, className);
      if (target) {
        ElementDragger.dragElement = target;
        ElementDragger.dragElement.clickLocation = {
          x: e.clientX,
          y: e.clientY,
        };
        ElementDragger.active = true;
        return;
      }
    }
  }
  static drag(e) {
    ElementDragger.mosuseData = { x: e.clientX, y: e.clientY };
    if (ElementDragger.active && ElementDragger.dragElement != null) {
      let d_element = ElementDragger.dragElement;
      let clickLocation = d_element.clickLocation;
      let detaX = e.clientX - clickLocation.x;
      let detaY = e.clientY - clickLocation.y;
      let t = 'translate3d(' + detaX + 'px,' + detaY + 'px,0)';
      d_element.style.transform = t;
    }
  }
  static end(e) {
    e.preventDefault();
    if (ElementDragger.dragElement != null) {
      let d_element = ElementDragger.dragElement;
      let clickLocation = d_element.clickLocation;
      let detaX = e.clientX - clickLocation.x;
      let detaY = e.clientY - clickLocation.y;
      let left = Number(d_element.style.left.replace('px', ''));
      let top = Number(d_element.style.top.replace('px', ''));
      d_element.style.left = (left + detaX).toString() + 'px';
      d_element.style.top = (top + detaY).toString() + 'px';
      let t = 'translate3d(0,0,0)';
      d_element.style.transform = t;
      ElementDragger.dragElement = null;
    }
  }
}
class Chapter_Section {
  self = this;
  chapters = [];
  addChapter(element) {
    let controler = new Chapter_Controller(element);
    this.chapters.push(controler);
    let numberSteps = element.getElementsByClassName('numberSteps')[0];
    var myFunction = function (e) {
      if (e.key === 'Enter') {
        controler.generateSteps(e);
        numberSteps.removeEventListener('keyup', myFunction);
      }
    };
    numberSteps.addEventListener('keyup', myFunction);

    let moduleName = element.getElementsByClassName('moduleName')[0];
    moduleName.addEventListener('change', (e) => {
      controler.updateChapters(moduleName);
      treeView.display();
    });
  }
  remove(element) {
    for (let i in self.chapters) {
      if (element == self.chapters[i]) {
        // delete self.chapters[i];
        chapterData.steps.splice(i, 1);
        element.remove();
        return;
      }
    }
  }
}
class Chapter_Controller {
  self = this;
  chapter;
  constructor(moduleChapter) {
    this.chapter = moduleChapter;
  }
  generateStepsFormModuleChapters = function (moduleChapter) {
    treeView.addChapter(moduleChapter);
    var numStepsContainer = moduleChapter.getElementsByClassName(
      'moduleChapterSteps'
    );
    var moduleName = moduleChapter.getElementsByClassName('moduleName')[0];
    var moduleChapterId = moduleChapter.id;
    var chapterName = removeAllWhiteSpace(moduleName);
    var input = numStepsContainer[0].getElementsByTagName('input')[0];
    var steps = input.value;

    var stepsInChapters = document.getElementsByClassName(moduleChapterId);

    for (let i = 0; i < stepsInChapters.length; i++) {
      if (stepsInChapters[i].nodeName != 'DIV') {
        stepsInChapters[i].remove();
        i--;
      } else {
        treeView.updateStepName(stepsInChapters[i]);
      }
    }

    if (Number(steps) == stepsInChapters.length) {
      return;
    } else if (Number(steps) <= stepsInChapters.length) {
      for (
        var step = stepsInChapters.length - 1;
        step >= Number(steps);
        step--
      ) {
        stepsInChapters[step].remove();
      }
      return;
    }

    input.setAttribute('value', steps);
    let theDocument = document.getElementById('theDocument');
    for (var step = stepsInChapters.length; step < Number(steps); step++) {
      var mvTable = getTempletElement('mv-table');
      mvTable.id = Dev.uuid();
      mvTable.classList.add(moduleChapterId);
      var modualChapter = mvTable.getElementsByClassName('taskOrder-number')[0];
      var taskOrder_stepNumber = mvTable.getElementsByClassName(
        'taskOrder_stepNumber'
      )[0];
      var input = mvTable.getElementsByClassName('start')[0];
      input.value = (step + 1).toString();
      input.setAttribute('value', (step + 1).toString());
      modualChapter.innerHTML = moduleName.value;
      taskOrder_stepNumber.value = step + 1;
      taskOrder_stepNumber.dataset.step = step + 1;
      taskOrder_stepNumber.setAttribute('value', (step + 1).toString());
      mvTable.classList.add(removeAllWhiteSpace(moduleName));

      if (step - 1 < 0) {
        theDocument.append(mvTable);
      } else {
        theDocument.insertBefore(
          mvTable,
          stepsInChapters[step - 1].nextSibling
        );
      }
      treeView.addStepToChapter(mvTable);
    }
  };

  generateSteps(event) {
    if (event.key === 'Enter') {
      this.generateStepsFormModuleChapters(this.chapter);
      treeView.display();
      COMPONENTS.brodcast();
      LOCATIONS.brodcast();
      return;
    }
  }
  updateChapters(element) {
    var chapterName = element.value;
    var id = this.chapter.id;
    var stepTables = document.getElementsByClassName(id);
    for (let i = 0; i < stepTables.length; i++) {
      const table = stepTables[i];
      if (table.nodeName == 'LI') {
        treeView.updateChapterName(id, chapterName);
      } else {
        var modualChapter = table.getElementsByClassName('taskOrder-number')[0];
        var oldClassname = modualChapter.value;
        table.classList.remove(oldClassname);
        modualChapter.innerHTML = chapterName;
        table.classList.add(chapterName);
      }
    }
  }
}
class MenueItemData_Factory {
  static buildModuleChaptersMenu(elemnet, cs) {
    let submenu = [];
    let addItem = new MenueItemData('Add', Ux_Actions.appendChapter);
    addItem.arg.push(elemnet);
    addItem.arg.push(cs);

    let deleteItem = new MenueItemData('Delete', Ux_Actions.deleteElement);
    deleteItem.arg.push(elemnet);

    submenu.push(deleteItem);
    submenu.push(addItem);
    return submenu;
  }
  static buildTableMenu(elemnet) {
    let submenu = [];
    let append = new MenueItemData('append', null);
    append.sub = [];
    let appendTable = new MenueItemData('Table', Ux_Actions.appendElement);
    appendTable.arg.push(elemnet);
    let appendWarning = new MenueItemData('Warning', Ux_Actions.appendElement);
    appendWarning.arg.push(elemnet);
    let appendNote = new MenueItemData('Note', Ux_Actions.appendElement);
    appendNote.arg.push(elemnet);
    let appendCaution = new MenueItemData('Caution', Ux_Actions.appendElement);
    appendCaution.arg.push(elemnet);

    append.sub.push(appendTable);
    append.sub.push(appendWarning);
    append.sub.push(appendNote);
    append.sub.push(appendCaution);

    let prepend = new MenueItemData('prepend', null);
    prepend.sub = [];
    let prependTable = new MenueItemData('Table', Ux_Actions.prependElement);
    prependTable.arg.push(elemnet);

    let prependWarning = new MenueItemData(
      'Warning',
      Ux_Actions.prependElement
    );
    prependWarning.arg.push(elemnet);

    let prependNote = new MenueItemData('Note', Ux_Actions.prependElement);
    prependNote.arg.push(elemnet);

    let prependCaution = new MenueItemData(
      'Caution',
      Ux_Actions.prependElement
    );
    prependCaution.arg.push(elemnet);

    prepend.sub.push(prependTable);
    prepend.sub.push(prependWarning);
    prepend.sub.push(prependNote);
    prepend.sub.push(prependCaution);

    let deleteItem = new MenueItemData('Delete', Ux_Actions.deleteElement);
    deleteItem.arg.push(elemnet);

    submenu.push(prepend);
    submenu.push(append);
    submenu.push(deleteItem);
    return submenu;
  }
  static buildActionMenu(elemnet) {
    let submenu = [];
    let addItem = new MenueItemData('Add', Ux_Actions.appendElement);
    addItem.arg.push(elemnet);

    let deleteItem = new MenueItemData('Delete', Ux_Actions.deleteElement);
    deleteItem.arg.push(elemnet);

    submenu.push(deleteItem);
    submenu.push(addItem);
    return submenu;
  }
  static buildCompletionRangeMenu(elemnet) {
    let submenu = [];
    let switchItem = new MenueItemData('Switch', Ux_Actions.switchElement);
    switchItem.arg.push(elemnet);

    submenu.push(switchItem);
    return submenu;
  }
}
class ContextMenu {
  self = this;
  contextMenu = null;
  constructor() {
    this.contextMenu = document.createElement('div');
    this.contextMenu.classList.add('contextMenu');
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'X';
    closeButton.addEventListener('click', (e) => {
      this.contextMenu.style.display = 'none';
      this.contextMenu.classList.remove('show');
    });
    const contextMenuHeader = document.createElement('div');
    contextMenuHeader.classList.add('contextMenuHeader');
    contextMenuHeader.append(closeButton);
    this.contextMenu.append(contextMenuHeader);
    const contextMenuBody = document.createElement('div');
    contextMenuBody.classList.add('contextMenuBody');
    this.contextMenu.append(contextMenuBody);
    const ul = document.createElement('ul');
    ul.id = 'contextMenuContent';
    contextMenuBody.append(ul);
    contextMenuHeader.addEventListener('mousedown', ElementDragger.start);
    contextMenuHeader.addEventListener('mouseup', ElementDragger.end);
  }
  display() {
    var x = ElementDragger.mosuseData.x;
    var y = ElementDragger.mosuseData.y;
    this.contextMenu.classList.add('show');
    this.contextMenu.style.display = 'block';
    this.contextMenu.style.left = x + 'px';
    this.contextMenu.style.top = y + 'px';
    document.body.appendChild(this.contextMenu);
  }
  updataData(dataList) {
    let contextMenuBody = this.contextMenu.getElementsByClassName(
      'contextMenuBody'
    )[0];
    contextMenuBody.innerHTML = '';
    let ul = GUI_Util.buildMenu(dataList);
    contextMenuBody.append(ul);
  }
  getContextMenu() {
    return this.contextMenu;
  }
}
class ContextMenu_Controller {
  self = this;
  static cm;
  static lookuptable = {
    'mv-table': 'Table',
    step_description: 'Step Description',
    'action-row': 'Actions',
    completion_range: 'Completion Range',
    moduleChapter: 'Chapter',
  };

  static class_filter = [
    'mv-table',
    'step_description',
    'step_description_subSteps',
    'action-row',
    'completion_range',
    'moduleChapter',
  ];
  static populateDataClick(e) {
    if (!(e.ctrlKey && e.button == 0)) {
      return;
    }
    ContextMenu_Controller.populateData(e.target);
  }
  static populateData(element) {
    let currentTarget = element;
    //There is nothing we want todo with a bold node. We want the parent.
    var data_stack = [];
    while (currentTarget) {
      ContextMenu_Controller.class_filter.forEach((name) => {
        var flag = currentTarget.className.includes(name);
        if (flag) {
          data_stack.push({ className: name, element: currentTarget });
        }
      });
      currentTarget = currentTarget.parentElement;
    }
    var dataList = ContextMenu_Controller.buildDataList(data_stack);
    dataList.push({
      text: 'Actions',
      trigger: null,
      filter: [
        {
          text: 'ensure',
          trigger: function () {
            insertText('ensure');
          },
          sub: null,
        },
        {
          text: 'set',
          trigger: function () {
            insertText('set');
          },
          sub: null,
        },
        {
          text: 'verify',
          trigger: function () {
            insertText('verify');
          },
          sub: null,
        },
        {
          text: 'navigate',
          trigger: function () {
            insertText('navigate');
          },
          sub: null,
        },
        {
          text: 'read',
          trigger: function () {
            insertText('read');
          },
          sub: null,
        },
        {
          text: 'wait',
          trigger: function () {
            insertText('wait');
          },
          sub: null,
        },
        {
          text: 'hold',
          trigger: function () {
            insertText('hold');
          },
          sub: null,
        },
      ],
    });
    ContextMenu_Controller.cm.updataData(dataList);
  }
  static buildMenu(e) {
    if (!(e.ctrlKey && e.key == 'a')) {
      return;
    }
    e.preventDefault();
    if (
      !ContextMenu_Controller.cm.getContextMenu().className.includes('show')
    ) {
      ContextMenu_Controller.cm.display();
    }
  }

  static buildDataList(data_stack) {
    var dataList = [];
    //There is nothing we want todo with a bold node. We want the parent.
    data_stack.forEach((element) => {
      let name = ContextMenu_Controller.lookuptable[element.className];
      let item = new MenueItemData(name, null);
      switch (name) {
        case 'Table':
          item.sub = MenueItemData_Factory.buildTableMenu(element.element);
          break;
        case 'Chapter':
          item.sub = MenueItemData_Factory.buildModuleChaptersMenu(
            element.element,
            cs
          );
          break;
        case 'Actions':
          item.sub = MenueItemData_Factory.buildActionMenu(element.element);
          break;
        case 'Completion Range':
          item.sub = MenueItemData_Factory.buildCompletionRangeMenu(
            element.element
          );
          break;
      }
      dataList.push(item);
    });

    return dataList;
  }
}
class ActionButton {
  static ButtonTypes = {
    delete: 'fa fa-trash fa-lg',
    caution: 'fa fa-warning fa-lg',
    copy: 'fa fa-copy fa-lg',
    warning: 'fa fa-warning fa-lg',
    note: 'fa fa-book fa-lg',
    list: 'fa fa-list fa-lg',
    eye: 'fa fa-eye fa-xs',
  };
  constructor(list_buttonData) {
    this.element = document.createElement('div');
    this.element.classList.add('actionButton');
    let div = document.createElement('div');
    this.element.append(div);
    for (let i = 0; i < list_buttonData.length; i++) {
      let buttonData = list_buttonData[i];
      let button = document.createElement('button');
      let icon = document.createElement('i');
      button.append(icon);
      icon.className = ActionButton.ButtonTypes[buttonData];
      div.append(button);
    }
    this.buttons = div.children;
  }
  html() {
    return this.element.outerHTML;
  }
  addClickAction(actions) {
    for (let i = 0; i < this.buttons; i++) {
      let button = this.buttons[i];
      button.onclick = actions[i].trigger;
    }
  }
}
class Slider {
  static initSetup() {
    var slidecontainer = document.getElementsByClassName('slidecontainer');
    for (let i = 0; i < slidecontainer.length; i++) {
      let container = slidecontainer[i];
      let slider = container.getElementsByClassName('slider')[0];
      let value = container.getElementsByClassName('sliderValue')[0];
      slider.oninput = function () {
        value.innerHTML = this.value;
      };
    }
  }
  static elementSetup(element) {
    let slider = element.getElementsByClassName('slider')[0];
    let value = element.getElementsByClassName('sliderValue')[0];
    slider.oninput = function () {
      value.innerHTML = this.value;
    };
  }
}
class ActionSelect {
  static seletedOption(element) {
    let options = element.options;
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      option.removeAttribute('selected');
    }

    let index = element.selectedIndex;
    let option = element.options[index];
    option.setAttribute('selected', 'true');
  }
  static selection(element, ul) {
    let text = element.value;
    let li = document.createElement('li');
    let span = document.createElement('span');
    let select = document.createElement('select');
    select.setAttribute('style', 'visibility: visible');
    select.setAttribute('onchange', 'ActionSelect.seletedOption(this);');

    let input = document.createElement('input');
    input.setAttribute('onchange', "this.setAttribute('value', this.value);");
    switch (text) {
      case 'ensure':
        span.innerHTML = 'ensure';
        select.classList.add('component_dropdown');
        input.setAttribute('type', 'text');
        li.append(span);
        li.append(select);
        li.append(input);
        let ensure_selectObserver = new SelectObserver(select);
        COMPONENTS.addObserver(ensure_selectObserver);
        break;
      case 'set':
        span.innerHTML = 'set';
        select.classList.add('component_dropdown');
        input.setAttribute('type', 'text');
        li.append(span);
        li.append(select);
        li.append(input);
        let set_selectObserver = new SelectObserver(select);
        COMPONENTS.addObserver(set_selectObserver);
        break;
      case 'verify':
        span.innerHTML = 'verify';
        select.classList.add('component_dropdown');
        li.append(span);
        li.append(select);
        let verify_selectObserver = new SelectObserver(select);
        COMPONENTS.addObserver(verify_selectObserver);
        break;
      case 'navigate':
        span.innerHTML = 'navigate';
        select.classList.add('location_personnel_dropdown');
        li.append(span);
        li.append(select);
        let navigate_selectObserver = new SelectObserver(select);
        LOCATIONS.addObserver(navigate_selectObserver);
        break;
      case 'read':
        span.innerHTML = 'read';
        li.append(span);
        break;
      case 'wait':
        span.innerHTML = 'wait';
        input.setAttribute('type', 'number');
        li.append(span);
        li.append(input);
        break;
      case 'hold':
        span.innerHTML = 'hold';
        select.classList.add('component_dropdown');
        input.setAttribute('type', 'text');
        let clone = input.cloneNode(true);
        clone.setAttribute('type', 'number');
        clone.setAttribute(
          'onchange',
          "this.setAttribute('value', this.value);"
        );
        li.append(span);
        li.append(select);
        li.append(input);
        li.append(clone);
        let hold_selectObserver = new SelectObserver(select);
        COMPONENTS.addObserver(hold_selectObserver);
        break;
      case 'require':
        span.innerHTML = 'require';
        input.setAttribute('type', 'text');
        let require_clone = input.cloneNode(true);
        require_clone.setAttribute('type', 'text');
        require_clone.setAttribute(
          'onchange',
          "this.setAttribute('value', this.value);"
        );

        li.append(span);
        li.append(input);
        li.append(require_clone);
        break;
    }
    ul.innerHTML = '';
    ul.append(li);
    COMPONENTS.brodcast();
    LOCATIONS.brodcast();
    return li;
  }
}

var treeView = new TreeView();
var pt = new PredictiveText();
var cs = new Chapter_Section();
var cm = new ContextMenu();
const COMPONENTS = new Subject();
const LOCATIONS = new Subject();
let keyWords = ['ensure', 'set', 'verify', 'navigate', 'read', 'wait', 'hold'];

var json_obj = undefined;
ipcRenderer.on('json-reply', function (event, data) {
  let json = data;
  let obj = JSON.parse(json);
  json_obj = obj;
  console.log(json_obj);
});
ipcRenderer.on('base64-reply', function (event, data) {
  //do what you want with the path/file selected, for example:
  var base64 = data;
  var img = document.createElement('img');
  img.src = 'data:image/png;base64,' + base64;
  let li = document.createElement('li');
  let div = document.createElement('div');
  let br = document.createElement('br');
  div.classList.add('imgContainer');
  div.append(img);
  div.append(br);
  div.setAttribute('style', 'position: relative; left:0px;');
  div.setAttribute('contenteditable', 'false');

  let width = document.createElement('input');
  width.setAttribute('type', 'number');
  width.setAttribute('placeholder', 'width');
  width.setAttribute('value', 200);
  width.onchange = function (e) {
    img.width = width.value;
  };
  img.width = 200;
  div.append(width);

  let height = document.createElement('input');
  height.setAttribute('type', 'number');
  height.setAttribute('placeholder', 'height');
  height.onchange = function (e) {
    img.height = height.value;
  };
  div.append(height);
  li.append(div);
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(li);
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
});
ipcRenderer.on('save-doc', function (event, docText) {
  //do what you want with the path/file selected, for example:
  cleanDocumentForSaving();
  saveMetaData('treeViewData', treeView.chapters);
  saveMetaData('COMPONENTSData', COMPONENTS.lookuptable);
  saveMetaData('LOCATIONSData', LOCATIONS.lookuptable);
  saveMetaData('DesignerName', {
    name: document.getElementById('d_name').innerText,
  });
  saveMetaData('doc_Version', {
    version: document.getElementById('app_version').innerText,
  });

  var docText = document.getElementById('theDocument').innerHTML;
  ipcRenderer.send('save-doc', { text: docText });
});
ipcRenderer.on('exportpdf-doc', function (event, docText) {
  exportpdf();
});
ipcRenderer.on('load-doc', function (event, data) {
  //do what you want with the path/file selected, for example:
  var div = document.createElement('div');
  div.innerHTML = data.html;
  theDocument.innerHTML = '';

  var children = div.children;

  while (children.length > 0) {
    theDocument.append(children[0]);
  }
  setUpDocument();
});

ContextMenu_Controller.cm = cm;

function MenueItemData(text, trigger) {
  this.text = text;
  this.trigger = trigger;
  this.arg = [];
}
function getSeletedWord(selection) {
  var range = selection.getRangeAt(0);
  let oldStartOffset = range.startOffset;
  let oldEndOffset = range.endOffset;
  range.oldStartOffset = oldStartOffset;
  range.oldEndOffset = oldEndOffset;
  if (selection.anchorNode.data != undefined) {
    console.log(selection.anchorNode.data);
  }
  while (range.toString()[0] != ' ' && range.startOffset > 0) {
    range.setStart(selection.anchorNode, range.startOffset - 1);
    if (range.toString()[0] == ' ') {
      range.setStart(selection.anchorNode, range.startOffset + 1);
      break;
    }
  }
  if (selection.anchorNode.data == undefined) {
    console.log('here');
  }
  if (range.toString().length > 0 && selection.anchorNode.data != undefined) {
    while (
      range.toString()[range.toString().length - 1] != ' ' &&
      range.endOffset < selection.anchorNode.data.length
    ) {
      range.setEnd(selection.anchorNode, range.endOffset + 1);
    }
  }
  return range;
}
function removeAllWhiteSpace(text) {
  if (text.value) {
    return text.value.replace(/\s+/g, '_');
  } else if (text.innerHTML) {
    return text.innerHTML.replace(/\s+/g, '_');
  }
}
function cleanDocumentForSaving() {
  pt.elemnet.remove();
}
function saveMetaData(id, object) {
  let metaData = document.getElementById(id);
  let jsonData = JSON.stringify(object);
  metaData.setAttribute('content', jsonData);
}
function parse_metaData(id) {
  let metaData = document.getElementById(id);
  if (metaData.content != '') {
    let obj = JSON.parse(metaData.content);
    return obj;
  }
  return null;
}
function getTempletElement(tempName) {
  var div = document.createElement('div');

  try {
    var data = fs.readFileSync(
      __dirname + '/../../temp/' + tempName + '.html',
      'utf8'
    );
    div.innerHTML = data.toString();
    var element = div.firstElementChild;
    setTimeout(() => {
      element.classList.remove('hide');
      element.classList.add('show');
    }, 50);

    let component = element.getElementsByClassName('component');
    if (component.length > 0) {
      component[0].onkeyup = Ux_Actions.newListItem_uuid;
      component[0].subject = COMPONENTS;
    }
    let location_personnel = element.getElementsByClassName(
      'location_personnel'
    );
    if (location_personnel.length > 0) {
      location_personnel[0].onkeyup = Ux_Actions.newListItem_uuid;
      location_personnel[0].subject = LOCATIONS;
    }
    let select_component = element.getElementsByClassName('component_dropdown');
    if (select_component.length > 0) {
      let selectObserver = new SelectObserver(
        select_component[0],
        component[0]
      );
      COMPONENTS.addObserver(selectObserver);
    }
    let select_location = element.getElementsByClassName(
      'location_personnel_dropdown'
    );
    if (select_location.length > 0) {
      let selectObserver = new SelectObserver(
        select_location[0],
        location_personnel[0]
      );
      LOCATIONS.addObserver(selectObserver);
    }

    return element;
  } catch (e) {
    console.log(__dirname);
    console.log('Error:', e.stack);
  }
}
function sendDocToMainProcess() {
  var doc = document.getElementById('theDocument');
  ipcRenderer.send('get-ipcRenderer', doc.innerHTML);
}
function exportpdf() {
  let head = document.getElementById('head');
  var prtContent = document.getElementById('theDocument');
  var WinPrint = window.open(
    '',
    '',
    'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0'
  );
  WinPrint.document.write(head.innerHTML + prtContent.innerHTML);
  let button = WinPrint.document.createElement('button');
  button.innerHTML = 'this is a Test!';
  WinPrint.document.body.prepend(button);
  button.onclick = function (e) {
    WinPrint.print();
  };
  WinPrint.document.close();
  return WinPrint;
}
function setUpDocument() {
  window.onkeydown = ContextMenu_Controller.buildMenu;
  window.onmousedown = ContextMenu_Controller.populateDataClick;
  window.onmousemove = ElementDragger.drag;

  DocumentLoad.setup_Subjects(COMPONENTS, 'components_list');
  DocumentLoad.setup_Subjects(LOCATIONS, 'location_personnel_list');
  DocumentLoad.setup_Subjects_SelectObserver(COMPONENTS, 'component_dropdown');
  DocumentLoad.setup_Subjects_SelectObserver(
    LOCATIONS,
    'location_personnel_dropdown'
  );
  DocumentLoad.addEvenetListernToTabbButtons();
  DocumentLoad.populate_Subject(COMPONENTS, 'component');
  DocumentLoad.populate_Subject(LOCATIONS, 'location_personnel');
  Slider.initSetup();

  Subject.populate_lookupTable(COMPONENTS, 'COMPONENTSData');
  Subject.populate_lookupTable(LOCATIONS, 'LOCATIONSData');
  TreeView.populate_chapterData(treeView);
  treeView.display();

  pt.populateList(keyWords);

  let DesignerName = parse_metaData('DesignerName');
  if (DesignerName) {
    document.getElementById('d_name').innerHTML = DesignerName.name;
  }
  let doc_Version = parse_metaData('doc_Version');
  if (doc_Version) {
    document.getElementById('doc_version').innerHTML = doc_Version.version;
  }
}

window.onload = function (e) {
  setUpDocument();
  let chapters = document.getElementsByClassName('moduleChapter');
  for (let i = 0; i < chapters.length; i++) {
    cs.addChapter(chapters[i]);
  }
};
window.addEventListener('paste', (e) => {
  var text = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
  e.preventDefault();
});
sendDocToMainProcess();
