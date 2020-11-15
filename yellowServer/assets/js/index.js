window.jQuery = window.$ = require('jquery');
const { ipcRenderer, remote, clipboard } = require('electron');
const { Menu } = remote;
const fs = require('fs');
const { disconnect, off, setFdLimit } = require('process');
const { contains } = require('jquery');
const contextMenu = require('electron-context-menu');
const { SIGCHLD } = require('constants');

var class_filter = [
  'action_row',
  'mv-table',
  'voice_over',
  'unguided_assessment',
  'score_weight',
  'completion_range',
  'moduleChapter',
  'step_description',
  'action-row',
  'score_weight',
];
var actions = ['ensure', 'set', 'verify', 'navigate', 'read', 'wait', 'hold'];
var templatefiles = [
  'mv-caution',
  'mv-chapters',
  'mv-modules',
  'mv-note',
  'mv-table',
  'mv-warning',
];

COMPONENTS = {
  lookupTable: [],
  idList: [],
  listener: function () {},
  put: function (key, val) {
    this.lookupTable[key] = val;
    this.listener();
  },
  registerListener: function (listener) {
    this.listener = listener;
  },
  removeItem: function (key) {
    delete this.lookupTable[key];
    // this.listener();
  },
  updateElements: function () {
    for (id in this.idList) {
      var element = document.getElementById(this.idList[id]);
      var itemsToAdd = [];
      var itemsToRemove = [];
      for (key in this.lookupTable) {
        var item = element.getElementsByClassName(key);
        if (item == null || item == undefined) {
          const li = document.createElement(li);
          li.classList.add(key);
          li.innerHTML = lookupTable[key];
          itemsToAdd.push(li);
        }
      }
      var children = element.children;

      var childrenToRemove = [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!(child.className in this.lookupTable)) {
          // child.remove();
          childrenToRemove.push(child);
        }
      }
      for (child in childrenToRemove) {
        childrenToRemove[child].remove();
      }

      if (item in itemsToAdd) {
        element.append(item);
      }
    }
  },
};

COMPONENTS.idList.push('components');
COMPONENTS.idList.push('components_information');

var LOCATIONS = {
  lookupTable: [],
  idList: [],
  listener: function () {},
  put: function (key, val) {
    this.lookupTable[key] = val;
    this.listener();
  },
  registerListener: function (listener) {
    this.listener = listener;
  },
  removeItem: function (key) {
    delete this.lookupTable[key];
    // this.listener();
  },
  updateElements: function () {
    for (id in this.idList) {
      var element = document.getElementById(this.idList[id]);
      var itemsToAdd = [];
      var itemsToRemove = [];
      for (key in this.lookupTable) {
        var item = element.getElementsByClassName(key);
        if (item == null || item == undefined) {
          const li = document.createElement(li);
          li.classList.add(key);
          li.innerHTML = lookupTable[key];
          itemsToAdd.push(li);
        }
      }
      var children = element.children;

      var childrenToRemove = [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!(child.className in this.lookupTable)) {
          // child.remove();
          childrenToRemove.push(child);
        }
      }
      for (child in childrenToRemove) {
        childrenToRemove[child].remove();
      }

      if (item in itemsToAdd) {
        element.append(item);
      }
    }
  },
};

LOCATIONS.idList.push('loactions_personnel');
LOCATIONS.idList.push('loactions_personnel_information');

var PERSONNEL = [];

var controlDown = false;
var pageShield = undefined;
var activeElement = undefined;

var active_chapter = document.getElementById('active_chapter');
var copy_button = document.getElementById('copy_button');
var list_button = document.getElementById('list_button');
var apply_button = document.getElementById('apply_button');
var delete_button = document.getElementById('delete_button');
var swich_button = document.getElementById('swich_button');

var apply_button_tooltip = document.getElementById('apply_button_tooltip');
var copy_button_tooltip = document.getElementById('copy_button_tooltip');
var list_button_tooltip = document.getElementById('list_button_tooltip');
var apply_button_tooltip = document.getElementById('apply_button_tooltip');
var delete_button_tooltip = document.getElementById('delete_button_tooltip');
var swich_button_tooltip = document.getElementById('swich_button_tooltip');

copy_button.style.display = 'none';
list_button.style.display = 'none';
apply_button.style.display = 'none';
delete_button.style.display = 'none';
swich_button.style.display = 'none';

var contextmenu1 = undefined;
var clipBoard = undefined;
var dispose = undefined;
var delete_sound = new Audio(__dirname + '/assets/sounds/delete_paper.mp3');
var select_sound = new Audio(__dirname + '/assets/sounds/select.mp3');
var subListArray1 = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];
var left = document.getElementById('drag-left');
var right = document.getElementById('drag-right');
var bar = document.getElementById('dragbar');
var theDocument = document.getElementById('theDocument');
addPageShield();

const dragBar = (e) => {
  left.style.width = e.pageX - bar.offsetWidth / 2 + 'px';
};

copy_button.addEventListener('click', (e) => {
  if (activeElement != undefined) {
    var cloneElement = CloneWithAimnation(activeElement);
    cloneElement.id = uuidv4();
    cloneElement.classList.remove('activeElement');
  }
});
list_button.addEventListener('click', (e) => {
  if (activeElement != undefined) {
    if (activeElement.nodeName == 'LI') {
      var ol = document.createElement('ol');
      var li = document.createElement('li');
      li.classList.add('subItem');
      ol.append(li);
      li.innerHTML = 'N/A';
      if (
        !activeElement.parentElement.className.includes(
          'step_description_subSteps'
        )
      ) {
        ol.classList.add('step_description_subSteps');
        ol.setAttribute('style', ' list-style-type:lower-alpha;');
      }
      activeElement.append(ol);
    } else {
      toggleSubsteps(activeElement);
    }
    deactiveElement();
  }
});
apply_button.addEventListener('click', (e) => {
  if (activeElement != undefined) {
    var classList = activeElement.classList;
    if (classList.contains('step_description')) {
      applySubSteps(activeElement);
      setUpTreeView();
    } else if (classList.contains('step_table')) {
      var taskOrder_chanperName = activeElement.getElementsByClassName(
        'taskOrder-number'
      )[0];
      var step_table = getParentNodeWithClass(
        taskOrder_chanperName,
        'step_table'
      );
      var orginalClassChapter = taskOrder_chanperName.innerText.replace(
        ' ',
        '_'
      );
      step_table.classList.remove(orginalClassChapter);
      reassignChapter(taskOrder_chanperName);
      var chapterName = active_chapter.value;
      chapterName = chapterName.replace(' ', '_');
      step_table.classList.add(chapterName);
    }
  }
});
delete_button.addEventListener('click', (e) => {
  if (activeElement != undefined) {
    activeElement.classList.add('hide');
    setTimeout(() => {
      var nextSibling = activeElement.nextSibling;
      removeElement(activeElement);
      setUpTreeView();
      if (nextSibling == null) {
        activeElement = undefined;
      } else {
        activeElement = nextSibling;
        activeElement.classList.add('activeElement');
      }
    }, 450);
    delete_sound.play();
  }
});
swich_button.addEventListener('click', (e) => {
  if (activeElement != undefined) {
    switchElement(activeElement);
  }
});

bar.addEventListener('mousedown', () => {
  document.addEventListener('mousemove', dragBar);
});
bar.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', dragBar);
});

document.execCommand('defaultParagraphSeparator', false, 'li');

window.addEventListener('paste', (e) => {
  var text = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
  e.preventDefault();
});
if (document.addEventListener) {
  document.addEventListener('contextmenu', function (e) {
    var currentTarget = e.target;
    //There is nothing we want todo with a bold node. We want the parent.
    if (currentTarget.nodeName == 'B') {
      currentTarget = currentTarget.parentElement;
    }

    if (currentTarget.nodeName == 'P') {
      new_contextmenu('P', null);
    } else if (currentTarget.nodeName == 'LI') {
      currentTarget = currentTarget.parentElement;
      if (currentTarget.classList.contains('step_description_subSteps')) {
        new_contextmenu('subList', e.target);
      } else {
        new_contextmenu('list', currentTarget);
      }
    } else if (currentTarget.classList.contains('step_description')) {
      new_contextmenu('step_description', currentTarget);
    } else {
      var parent = currentTarget.parentElement;
      var stack = [];
      var stack_elements = [];
      while (parent) {
        class_filter.forEach((name) => {
          var flag = parent.className.includes(name);
          if (flag) {
            stack_elements.push(parent);
            stack.push(name);
          }
        });
        parent = parent.parentElement;
      }
      new_contextmenu(stack[0], stack_elements[0]);
    }
  });
}
theDocument.addEventListener('dblclick', function (e) {
  changetoolTipText();
  copy_button.style.display = 'none';
  list_button.style.display = 'none';
  apply_button.style.display = 'none';
  delete_button.style.display = 'none';
  swich_button.style.display = 'none';
  if (e.target.nodeName == 'P') {
    if (activeElement != undefined) {
      activeElement.classList.remove('activeElement');
    }
    new_contextmenu('P', null);
  } else if (e.target.classList.contains('subItem')) {
    if (activeElement != undefined) {
      deactiveElement();
    }
    activeElement = e.target;
    activeElement.classList.add('activeElement');
    changetoolTipText({ list: 'Create a sublist.' });
  } else if (
    e.target.classList.contains('step_description') ||
    e.target.classList.contains('completion_range')
  ) {
    if (activeElement == e.target) {
      activeElement.classList.remove('activeElement');
      activeElement = undefined;
      return;
    } else if (activeElement != undefined) {
      activeElement.classList.remove('activeElement');
    }
    activeElement = e.target;
    activeElement.classList.add('activeElement');
  } else {
    var parent = e.target.parentElement;
    var stack = [];
    var stack_elements = [];
    while (parent) {
      class_filter.forEach((name) => {
        var flag = parent.className.includes(name);
        if (name.includes('unguided_assessment') || name == 'action_row') {
          flag = false;
        }
        if (flag) {
          stack_elements.push(parent);
          stack.push(name);
        }
      });
      parent = parent.parentElement;
    }
    if (stack_elements[0] == activeElement) {
      if (activeElement != undefined) {
        activeElement.classList.remove('activeElement');
        activeElement = undefined;
      }
      return;
    } else {
      if (activeElement != undefined) {
        activeElement.classList.remove('activeElement');
      }
      activeElement = stack_elements[0];
      activeElement.classList.add('activeElement');
    }

    if (activeElement) {
      if (activeElement.className.includes('step_table')) {
        var active_chapter = document.getElementById('active_chapter');
        var modualChapter = activeElement.getElementsByClassName(
          'taskOrder-number'
        )[0];
        active_chapter.value = modualChapter.innerHTML;
      }
    }
  }

  if (activeElement != undefined) {
    var classList = activeElement.classList;
    if (activeElement.className.includes('step_table')) {
      changetoolTipText({
        active: 'Change chapter title',
        copy: 'Make a copy of the current step',
        list: 'none',
        apply: 'none',
        delete: 'Delete current step',
        swich: 'none',
      });

      copy_button.style.display = 'inline';
      list_button.style.display = 'none';
      apply_button.style.display = 'none';
      delete_button.style.display = 'inline';
      swich_button.style.display = 'none';
    } else if (activeElement.className.includes('action-row')) {
      changetoolTipText({
        active: 'Change chapter title',
        copy: 'Make a copy of the current step',
        list: 'none',
        apply: 'none',
        delete: 'Delete current step',
        swich: 'none',
      });

      copy_button.style.display = 'inline';
      list_button.style.display = 'none';
      apply_button.style.display = 'none';
      delete_button.style.display = 'inline';
      swich_button.style.display = 'none';
    } else if (activeElement.className.includes('completion_range')) {
      changetoolTipText({
        active: 'none',
        copy: 'none',
        list: 'none',
        apply: 'none',
        delete: 'none',
        swich: 'Toggle between Start and Start and End',
      });
      copy_button.style.display = 'none';
      list_button.style.display = 'none';
      apply_button.style.display = 'none';
      delete_button.style.display = 'none';
      swich_button.style.display = 'inline';
    } else if (activeElement.className.includes('moduleChapter')) {
      changetoolTipText({
        active: 'none',
        copy: 'Make a copy of the current Chapter',
        list: 'none',
        apply: 'none',
        delete: 'Delete current Chapter',
        swich: 'none',
      });
      copy_button.style.display = 'inline';
      list_button.style.display = 'none';
      apply_button.style.display = 'none';
      delete_button.style.display = 'inline';
      swich_button.style.display = 'none';
    } else if (activeElement.className.includes('step_description')) {
      changetoolTipText({
        active: 'none',
        copy: 'none',
        list: 'Add/Remove substep list',
        apply: 'Create subSteps',
        delete: 'none',
        swich: 'none',
      });
      copy_button.style.display = 'none';
      list_button.style.display = 'inline';
      apply_button.style.display = 'inline';
      delete_button.style.display = 'none';
      swich_button.style.display = 'none';
    }
  } else {
    copy_button.style.display = 'none';
    list_button.style.display = 'none';
    apply_button.style.display = 'none';
    delete_button.style.display = 'none';
    swich_button.style.display = 'none';
  }
});

function switchElement(element) {
  var childCount = 0;
  while (element.childElementCount > 0) {
    element.removeChild(element.children[0]);
    childCount++;
  }

  var input = document.createElement('input');
  input.classList.add('completion_range_select');
  input.setAttribute('onchange', "this.setAttribute('value', this.value);");
  input.setAttribute('value', '1');
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
function new_contextmenu(Name, element) {
  if (dispose != undefined) {
    dispose();
  }
  switch (Name) {
    case 'subList':
      dispose = contextMenu({
        prepend: (defaultActions, params, browserWindow) => [
          {
            label: 'Add SubList',
            click: () => {
              var ol = document.createElement('ol');
              var li = document.createElement('li');
              ol.append(li);
              li.innerHTML = 'N/A';
              element.append(ol);
            },
          },
        ],
      });
      break;
    case 'list':
    case 'P':
      dispose = contextMenu({
        prepend: (defaultActions, params, browserWindow) => [
          {
            label: 'Embed Img',
            click: () => {
              getfile();
              var li = document.createElement('li');
              element.append(li);
            },
          },
        ],
      });
      break;
    case 'step_description':
      dispose = contextMenu({
        prepend: (defaultActions, params, browserWindow) => [
          {
            label: 'Toggle Substeps',
            click: () => {
              toggleSubsteps(element);
            },
          },
          {
            label: 'Apply Substeps',
            click: () => {
              var table = getParentNodeWithClass(element, 'mv-table');
              if (table) {
                var ol = element.nextElementSibling;
                var state = element.nextElementSibling.style.display;
                if (state == 'block') {
                  var elementAppendNext2 = table;
                  var clones = [];
                  for (var i = 1; i < ol.childElementCount; i++) {
                    var cloneElement = CloneWithAimnation(elementAppendNext2);
                    clones.push(cloneElement);
                    elementAppendNext2 = cloneElement;
                  }
                  for (var i = 0; i < clones.length; i++) {
                    cloneStepnumber = clones[i].getElementsByClassName(
                      'taskOrder-stepNumber'
                    )[0];
                    cloneStepnumber.value =
                      cloneStepnumber.value + '.' + subListArray1[i + 1];
                    cloneStepnumber.dataset.step =
                      cloneStepnumber.value + '.' + subListArray1[i + 1];
                  }
                  stepnumber = table.getElementsByClassName(
                    'taskOrder-stepNumber'
                  )[0];
                  stepnumber.value = stepnumber.value + '.a';
                  stepnumber.dataset.step = stepnumber.value + '.a';
                } else {
                  stepnumber = table.getElementsByClassName(
                    'taskOrder-stepNumber'
                  )[0];
                  var newStep = stepnumber.value.split('.');
                  stepnumber.value = newStep[0];
                  stepnumber.dataset.step = newStep[0];
                  var ol = element.nextElementSibling;
                  for (var i = 1; i < ol.childElementCount; i++) {
                    table.nextSibling.remove();
                  }
                }
              }
              setUpTreeView();
            },
          },
        ],
      });
      break;
    case 'mv-table':
      var appendMenu = [];
      var prependMenu = [];
      templatefiles.forEach((name) => {
        appendMenu.push({
          label: name,
          click: () => {
            var temp = getTempletElement(name);
            element.append(temp);
            element.parentNode.insertBefore(temp, element.nextSibling);
          },
        });
        prependMenu.push({
          label: name,
          click: () => {
            var temp = getTempletElement(name);
            element.append(temp);
            element.parentNode.insertBefore(temp, element);
          },
        });
      });
      dispose = contextMenu({
        prepend: (defaultActions, params, browserWindow) => [
          {
            label: 'addStep',
            click: () => {
              CloneWithAimnation(element);
              setUpTreeView();
            },
          },
          {
            label: 'prepend',
            submenu: prependMenu,
          },
          {
            label: 'append',
            submenu: appendMenu,
          },
          {
            label: 'delete',
            click: () => {
              element.classList.add('hide');
              setTimeout(() => {
                removeElement(element);
                setUpTreeView();
              }, 450);
              delete_sound.play();
            },
          },
          {
            label: 'delete with Update',
            click: () => {
              element.classList.add('hide');
              setTimeout(() => {
                removeElement(element);
                updateSteps(element);
              }, 450);
              delete_sound.play();
            },
          },
        ],
      });
      break;
    case 'action_row':
      dispose = contextMenu({
        append: (defaultActions, params, browserWindow) => [
          {
            label: 'Add Row',
            click: () => {
              appenedCopy(element);
            },
          },
          {
            label: 'Delete Row',
            click: () => {
              removeElement(element);
            },
          },
        ],
      });
      break;
    case 'completion_range':
      dispose = contextMenu({
        prepend: (defaultActions, params, browserWindow) => [
          {
            label: '1 range',
            // Only show it when right-clicking text
            click: () => {
              var select = document.getElementsByClassName(
                'completion_range_select'
              )[0];
              select.classList.remove('start');
              var clone = select.cloneNode(true);
              clone.classList.add('start');

              var span1 = document.createElement('span');
              span1.innerHTML = 'Start ';
              span1.append(clone);
              while (element.childElementCount > 0) {
                element.removeChild(element.children[0]);
              }
              // selectCompletionRange(null, clone);
              element.append(span1);
            },
          },
          {
            label: '2 range',
            // Only show it when right-clicking text
            click: () => {
              var select = document.getElementsByClassName(
                'completion_range_select'
              )[0];
              select.classList.remove('start');
              var clone1 = select.cloneNode(true);
              clone1.classList.add('start');
              var clone2 = select.cloneNode(true);
              clone2.classList.add('end');

              var span1 = document.createElement('span');
              span1.innerHTML = 'Start ';
              span1.append(clone1);

              var span2 = document.createElement('span');
              span2.innerHTML = 'End ';
              span2.append(clone2);

              var seperator = document.createElement('span');
              seperator.innerHTML = ' - ';
              while (element.childElementCount > 0) {
                element.removeChild(element.children[0]);
              }
              element.append(span1);
              element.append(seperator);
              element.append(span2);
            },
          },
        ],
      });
      break;
    case 'moduleChapter':
      dispose = contextMenu({
        append: (defaultActions, params, browserWindow) => [
          {
            label: 'appenedCopy',
            click: () => {
              appenedCopy(element);
            },
          },
        ],
      });
      break;
  }
}

//############  Group-1
function create_json() {
  var storyBoard = { elements: [] };
  var theDocument_childern = theDocument.children;

  for (let index = 0; index < theDocument_childern.length; index++) {
    var child = theDocument_childern[index];
    if (child.id == 'pageShield') {
      continue;
    }
    var canJson = true;
    for (let i = 0; i < child.classList.length; i++) {
      const name = child.classList[i];
      if (name == 'mv-chapters') {
        break;
      }
      if (name == 'warning') {
        var element = tableData(child, 'warning');
        storyBoard.elements.push(element);
        break;
      }
      if (name == 'note') {
        var element = tableData(child, 'note');
        storyBoard.elements.push(element);
        break;
      }
      if (name == 'caution') {
        var element = tableData(child, 'caution');
        storyBoard.elements.push(element);
        break;
      }
      if (name == 'step_table') {
        var element = step_tableData(child);
        storyBoard.elements.push(element);
        break;
      }
    }
  }
  return JSON.stringify(storyBoard);
}
function tableData(element, tableType) {
  var tableObject = {
    type: tableType,
  };
  var table = element;
  var data = table.getElementsByTagName('p');

  tableObject.data = data[0].innerText;
  tableObject.media = data[1].innerText;

  return tableObject;
}
function step_tableData(element) {
  var tableObject = {
    type: 'step_table',
    action_row: [],
    component: [],
    location_personnel: [],
  };
  var table = element;

  var chapter = table.getElementsByClassName('taskOrder-number')[0];
  var taskOrder_stepNumber = table.getElementsByClassName(
    'taskOrder-stepNumber'
  )[0];
  var step_description = table.getElementsByClassName('step_description')[0];
  var step_description_subSteps = table.getElementsByClassName(
    'step_description_subSteps'
  )[0];
  var action_row = table.getElementsByClassName('action-row');

  tableObject.chapter = chapter.innerText.trim();
  tableObject.taskOrder_stepNumber = taskOrder_stepNumber.value.trim();
  tableObject.step_description = step_description.innerText.trim();
  tableObject.step_description_subSteps = step_description_subSteps.innerText.trim();

  for (var row = 0; row < action_row.length; row++) {
    var action_row_obj = {};
    var description_state_element = table.getElementsByClassName(
      'description_state'
    )[0];
    var tag_text_element = table.getElementsByClassName('tag_text')[0];
    var voice_over_element = table.getElementsByClassName('voice_over')[0];

    action_row_obj.description_state = description_state_element.innerText.trim();
    action_row_obj.tag_text = tag_text_element.innerText.trim();
    action_row_obj.voice_over = voice_over_element.innerText.trim();
    tableObject.action_row.push(action_row_obj);
  }

  var component = table.getElementsByClassName('component')[0];
  for (var i = 0; i < component.children.length; i++) {
    const item = component.children[i];
    tableObject.component.push(item.innerHTML);
  }
  var location_personnel = table.getElementsByClassName(
    'location_personnel'
  )[0];
  for (var i = 0; i < location_personnel.children.length; i++) {
    const item = location_personnel.children[i];
    tableObject.location_personnel.push(item.innerHTML);
  }

  var completion_range = table.getElementsByClassName('completion_range')[0];
  var start = completion_range.getElementsByClassName('start')[0];
  var end = completion_range.getElementsByClassName('end');
  if (end.length > 0) {
    end = end[0];
  } else {
    end = null;
  }
  tableObject.start = start.value;
  if (end) {
    tableObject.end = end.value;
  } else {
    tableObject.end = null;
  }

  var location_personnel = table.getElementsByClassName('score_weight')[0];

  return tableObject;
}
//############  END Group-1

//######### HelperFunctions
function removeAllWhiteSpace(text) {
  if (text.value) {
    return text.value.replace(/\s+/g, '_');
  }
  return text.innerHTML.replace(/\s+/g, '_');
}
function getParentNodeWithClass(element, className) {
  var parent = element.parentNode;
  while (parent) {
    for (let index = 0; index < parent.classList.length; index++) {
      if (parent.classList[index] == className) {
        return parent;
      }
    }
    parent = parent.parentElement;
  }
  return null;
}
//######### END HelperFunctions

function toggleSubsteps(element) {
  var state = element.nextElementSibling.style.display;
  if (state == 'block') {
    element.nextElementSibling.style.display = 'none';
  } else {
    element.nextElementSibling.style.display = 'block';
  }
}

function applySubSteps(element) {
  var table = getParentNodeWithClass(element, 'mv-table');
  if (table) {
    var ol = element.nextElementSibling;
    var state = element.nextElementSibling.style.display;
    if (state == 'block') {
      var elementAppendNext2 = table;
      var clones = [];
      for (var i = 1; i < ol.childElementCount; i++) {
        var cloneElement = CloneWithAimnation(elementAppendNext2);
        clones.push(cloneElement);
        elementAppendNext2 = cloneElement;
      }
      for (var i = 0; i < clones.length; i++) {
        cloneStepnumber = clones[i].getElementsByClassName(
          'taskOrder-stepNumber'
        )[0];
        cloneStepnumber.value =
          cloneStepnumber.value + '.' + subListArray1[i + 1];
        cloneStepnumber.dataset.step =
          cloneStepnumber.value + '.' + subListArray1[i + 1];
        clones[i]
          .getElementsByClassName('activeElement')[0]
          .classList.remove('activeElement');
      }
      stepnumber = table.getElementsByClassName('taskOrder-stepNumber')[0];
      stepnumber.value = stepnumber.value + '.a';
      stepnumber.dataset.step = stepnumber.value + '.a';
    } else {
      stepnumber = table.getElementsByClassName('taskOrder-stepNumber')[0];
      var newStep = stepnumber.value.split('.');
      stepnumber.value = newStep[0];
      stepnumber.dataset.step = newStep[0];
      var ol = element.nextElementSibling;
      for (var i = 1; i < ol.childElementCount; i++) {
        table.nextSibling.remove();
      }
    }
  }
}
function reassignChapter(element) {
  element.innerHTML = active_chapter.value;
}

function updateChapters(e, element) {
  var chapterName = element.value;
  var id = element.parentElement.parentElement.id;
  var stepTables = document.getElementsByClassName(id);
  for (let i = 0; i < stepTables.length; i++) {
    const table = stepTables[i];
    var modualChapter = table.getElementsByClassName('taskOrder-number')[0];
    var oldClassname = modualChapter.value;
    table.classList.remove(oldClassname);
    modualChapter.innerHTML = chapterName;
    table.classList.add(chapterName);
  }
  setUpTreeView();
}

function CloneWithAimnation(element) {
  var temp = element.cloneNode(true);
  temp.id = uuidv4();
  temp.classList.remove('show');
  temp.classList.add('hide');
  element.parentNode.insertBefore(temp, element.nextSibling);
  // updateSteps(element);
  setTimeout(() => {
    temp.classList.remove('hide');
    temp.classList.add('show');
  }, 50);
  return temp;
}
function insertTextAtCaret(text) {
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
}
function generateSteps(event, element) {
  if (event.keyCode === 13) {
    var moduleChapter = getParentNodeWithClass(element, 'moduleChapter');
    generateStepsFormModuleChapters(moduleChapter);
    setUpTreeView();
    return;
  }
}
function generateStepsFormModuleChapters(moduleChapter) {
  var numStepsContainer = moduleChapter.getElementsByClassName(
    'moduleChapterSteps'
  );
  var moduleChapterName = moduleChapter.getElementsByClassName(
    'moduleChapterName'
  )[0];
  var moduleChapterId = moduleChapter.id;
  var chapterName = removeAllWhiteSpace(moduleChapterName);
  var input = numStepsContainer[0].getElementsByTagName('input')[0];
  var steps = input.value;

  var stepsInChapters = document.getElementsByClassName(moduleChapterId);

  if (Number(steps) == stepsInChapters.length) {
    return;
  } else if (Number(steps) <= stepsInChapters.length) {
    for (var step = stepsInChapters.length - 1; step >= Number(steps); step--) {
      stepsInChapters[step].remove();
    }
    return;
  }

  input.setAttribute('value', steps);
  for (var step = stepsInChapters.length; step < Number(steps); step++) {
    var mvTable = getTempletElement('mv-table');
    mvTable.id = uuidv4();
    mvTable.classList.add(moduleChapterId);
    var modualChapter = mvTable.getElementsByClassName('taskOrder-number')[0];
    var taskOrder_stepNumber = mvTable.getElementsByClassName(
      'taskOrder-stepNumber'
    )[0];
    var input = mvTable.getElementsByClassName('start')[0];
    input.value = (step + 1).toString();
    modualChapter.innerHTML = moduleChapterName.value;
    taskOrder_stepNumber.value = step + 1;
    taskOrder_stepNumber.dataset.step = step + 1;
    mvTable.classList.add(removeAllWhiteSpace(moduleChapterName));
    theDocument.append(mvTable);
  }
}

function updateSteps(elemment) {
  var moduleChapters = document.getElementsByClassName('moduleChapter');

  var mvTables = document.getElementsByClassName('mv-table');
  var moduleChapter = document.getElementsByClassName('moduleChapter');
  var steps = document.getElementsByClassName('taskOrder-stepNumber');

  for (var i = 0; i < moduleChapters.length; i++) {
    var numStepsContainer = moduleChapters[i].getElementsByClassName(
      'moduleChapterSteps'
    );
    var moduleChapterName = moduleChapters[i].getElementsByClassName(
      'moduleChapterName'
    )[0];
    var className = removeAllWhiteSpace(moduleChapterName);
    var setpTables = document.getElementsByClassName(className);

    var stepNumber = 1;
    var subNumber = 0;
    var subflag = false;

    for (let j = 0; j < setpTables.length; j++) {
      var element = setpTables[j];
      var h1 = element.getElementsByClassName('taskOrder-stepNumber')[0];

      if (h1.innerHTML == stepNumber.toString()) {
        stepNumber++;
      } else if (
        h1.innerHTML ==
        stepNumber.toString() + '.' + subListArray1[subNumber]
      ) {
        subNumber++;
        //specal case if we are working with the last element, I know that it is dumb.
        if (j + 1 == setpTables.length) {
          stepNumber++;
        }
      } else if (h1.innerHTML == stepNumber + 1) {
        stepNumber++;
        stepNumber++;
        subNumber = 0;
      } else if (
        h1.innerHTML ==
        stepNumber + 1 + '.' + subListArray1[subNumber]
      ) {
        stepNumber++;
        stepNumber++;
      } else {
        if (
          h1.innerHTML ==
          (stepNumber + 1).toString() + '.' + subListArray1[0]
        ) {
          stepNumber++;
          subNumber = 1;
          h1.innerHTML = stepNumber.toString() + '.' + subListArray1[0];
        } else if (h1.innerHTML.includes('.')) {
          h1.innerHTML = stepNumber.toString() + '.' + subListArray1[subNumber];
          subNumber++;
          //specal case if we are working with the last element, I know that it is dumb.
          if (j + 1 == setpTables.length) {
            stepNumber++;
          }
        } else if (Number(h1.innerHTML) + 1 == stepNumber) {
          h1.innerHTML = stepNumber;
          subNumber = 0;
          stepNumber++;
        } else {
          stepNumber++;
          h1.innerHTML = stepNumber;
          subNumber = 0;
        }
      }
    }
    var numberSteps = moduleChapter[i].getElementsByClassName('numberSteps')[0];
    numberSteps.value = stepNumber - 1;
    numberSteps.setAttribute('value', numberSteps.value);
  }
}
function CountStepsInChapter(chapterName) {
  var stepNumber = 1;
  var subNumber = 0;
  var subflag = false;
  var setpTables = document.getElementsByClassName(chapterName);

  for (let j = 0; j < setpTables.length; j++) {
    var element = setpTables[j];
    var h1 = element.getElementsByClassName('taskOrder-stepNumber')[0];
    if (h1.innerHTML == stepNumber.toString()) {
      stepNumber++;
    } else if (
      h1.innerHTML ==
      stepNumber.toString() + '.' + subListArray1[subNumber]
    ) {
      subNumber++;
    } else if (h1.innerHTML == stepNumber + 1) {
      stepNumber++;
    } else if (
      h1.innerHTML ==
      stepNumber + 1 + '.' + subListArray1[subNumber]
    ) {
      stepNumber++;
      stepNumber++;
    } else {
      if (
        h1.innerHTML ==
        (stepNumber + 1).toString() + '.' + subListArray1[0]
      ) {
        stepNumber++;
        subNumber = 1;
      } else if (h1.innerHTML.includes('.')) {
        subNumber++;
      } else if (Number(h1.innerHTML) + 1 == stepNumber) {
        subNumber = 0;
      } else {
        stepNumber++;
        subNumber = 0;
      }
    }
  }

  return stepNumber;
}
function sendDocToMainProcess() {
  var doc = document.getElementById('theDocument');
  ipcRenderer.send('get-ipcRenderer', doc.innerHTML);
}
function addtab(e) {
  if (e.keyCode === 9) {
    // tab key
    e.preventDefault(); // this will prevent us from tabbing out of the editor
    var tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0');
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(tabNode);
      }
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = tabNode;
    }
  }
}

//UX functions
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  pageShield.hidden = false;
  ev.dataTransfer.setData('template', ev.target.dataset.template);
}
function drop(ev) {
  ev.preventDefault();
  var template = ev.dataTransfer.getData('template');
  var element = getTempletElement(template);
  ev.target.parentElement.appendChild(element);
  if (element.classList.contains('mv-chapters')) {
    var moduleChapter = element.getElementsByClassName('moduleChapter')[0];
    moduleChapter.id = uuidv4();
  } else {
    element.id = uuidv4();
  }
  if (element.classList.contains('step_table')) {
    var taskOrder_chanperName = element.getElementsByClassName(
      'taskOrder-number'
    )[0];
    if (taskOrder_chanperName) {
      reassignChapter(taskOrder_chanperName);
      var step_table = getParentNodeWithClass(
        taskOrder_chanperName,
        'step_table'
      );
      var chapterName = active_chapter.value;
      var moduleChapters = document.getElementsByClassName('moduleChapter');
      for (let i = 0; i < moduleChapters.length; i++) {
        const moduleChapter = moduleChapters[i];
        var moduleChapterNameElement = moduleChapter.getElementsByClassName(
          'moduleChapterName'
        )[0];
        if (chapterName == moduleChapterNameElement.value) {
          chapterName = chapterName.replace(' ', '_');
          step_table.classList.add(moduleChapters[i].id);
          step_table.classList.add(chapterName);
        }
      }
      chapterName = chapterName.replace(' ', '_');
      step_table.classList.add(chapterName);
      setUpTreeView();
      pageShield.hidden = true;
    }
  }
}

function dragend(ev) {
  pageShield.hidden = true;
}
function appenedCoxpy(element) {
  var clone = element.cloneNode(true);
  clone.classList.remove('activeElement');
  element.parentNode.insertBefore(clone, element.nextSibling);
}
function removeElement(element) {
  element.remove();
}
function getfile() {
  ipcRenderer.send('open-file-dialog', {});
}
function getTempletElement(tempName) {
  var div = document.createElement('div');

  try {
    var data = fs.readFileSync(
      __dirname + '/../temp/' + tempName + '.html',
      'utf8'
    );
    div.innerHTML = data.toString();
    var element = div.firstElementChild;
    setTimeout(() => {
      element.classList.remove('hide');
      element.classList.add('show');
    }, 50);

    return element;
  } catch (e) {
    console.log(__dirname);
    console.log('Error:', e.stack);
  }
}

function setUpTreeView() {
  var treeView = document.getElementById('treeView');
  treeView.innerHTML = '';
  treeViewTable = {};

  var filter = [];
  for (let i = 0; i < class_filter.length; i++) {
    filter.push(filter[i]);
  }
  filter.push('show');
  filter.push('hide');
  filter.push('note');
  filter.push('container');
  filter.push('mv-table');
  filter.push('mv-chapters');
  filter.push('warning');
  filter.push('caution');
  filter.push('step_table');

  var theDocument_childern = theDocument.children;

  for (let index = 0; index < theDocument_childern.length; index++) {
    var child = theDocument_childern[index];
    if (child.id == 'pageShield') {
      continue;
    }
    var taskOrder_stepNumber = child.getElementsByClassName(
      'taskOrder-stepNumber'
    )[0];
    var chapterNameElement = child.getElementsByClassName(
      'taskOrder-number'
    )[0];
    var chapterName;
    if (chapterNameElement) {
      var name = chapterNameElement.innerText;
      if (treeViewTable[name] == undefined) {
        var chapterName = document.createElement('LI');
        var sublist = document.createElement('ul');
        chapterName.innerHTML = "<span class='caret'>" + name.replace('_', ' ');
        chapterName.id = name;
        sublist.classList.add('nested');
        chapterName.appendChild(sublist);
        treeView.appendChild(chapterName);
        treeViewTable[name] = chapterName;
      }
      chapterName = treeViewTable[name];
      var sublist = chapterName.getElementsByClassName('nested')[0];
      var step = document.createElement('LI');
      var link = document.createElement('a');
      link.innerHTML = taskOrder_stepNumber.value.trim();
      link.setAttribute('href', '#' + child.id);
      step.appendChild(link);
      sublist.appendChild(step);
    }
  }

  var toggler = document.getElementsByClassName('caret');
  for (var i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener('click', function () {
      this.parentElement.querySelector('.nested').classList.toggle('active');
      this.classList.toggle('caret-down');
    });
  }
}
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function cleanDocumentForSaving() {
  removeAllActiveElements();
  removeShield();
}
function removeAllActiveElements() {
  var activeElements = document.getElementsByClassName('activeElement');
  for (let i = 0; i < activeElements.length; i++) {
    const element = activeElements[i];
    element.classList.remove('activeElement');
  }
}
function removeShield() {
  pageShield.remove();
}
function addPageShield() {
  pageShield = getTempletElement('pageShield');
  theDocument.insertBefore(pageShield, theDocument.children[0]);
  pageShield.hidden = true;
}
function setUpTabButtons() {
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
setUpTabButtons();
function addSubTask(element) {
  var children = element.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    var flag = element.className.includes('subItem');
    if (!flag) {
      child.classList.add('subItem');
      child.classList.remove('activeElement');
    }
  }
}
function deactiveElement() {
  activeElement.classList.remove('activeElement');
  activeElement = undefined;
}

function addElementsToList(event, element, lookupTableContainer) {
  if (
    event.key == 'ArrowLeft' ||
    event.key == 'ArrowRight' ||
    event.key == 'ArrowUp' ||
    event.key == 'ArrowDown'
  ) {
    return;
  }
  if (event.key == 'Backspace') {
    var li = window.getSelection().anchorNode.parentElement;
    var ul = li.parentElement;
    const childeCount = ul.children.length;
    const keyCount = Object.keys(lookupTableContainer.lookupTable).length;
    if (childeCount < keyCount) {
      for (const id in lookupTableContainer.lookupTable) {
        items = ul.getElementsByClassName(id);
        if (items.length == 0) {
          lookupTableContainer.removeItem(id);
        }
      }
    }
  }

  if (event.key == 'Enter') {
    var newElement = window.getSelection().anchorNode;
    if (newElement.nodeName == 'LI') {
      newElement.className = uuidv4();
    } else {
      window.getSelection().anchorNode.parentElement;
    }
    var children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.className == '') {
        child.className = uuidv4();
        lookupTableContainer.put(child.className, child.innerText);
      } else {
        lookupTableContainer.put(child.className, child.innerText);
      }
    }
  } else {
    var newElement = window.getSelection().anchorNode;
    if (!(newElement.nodeName == 'LI')) {
      newElement = newElement.parentElement;
    }
    lookupTableContainer.put(newElement.className, newElement.innerText);
  }
  lookupTableContainer.updateElements();
}

function addEvenetListernToTabbButtons() {
  var tab = document.getElementsByClassName('tab')[0];
  var tabButtons = tab.children[0].children;
  for (let i = 0; i < tabButtons.length; i++) {
    const tabButton = tabButtons[i];
    tabButton.addEventListener('click', (e) => {
      const button = e.target;
      for (let index = 0; index < tabButtons.length; index++) {
        const element = tabButtons[index];
        element.classList.remove('activeTab');
      }
      button.classList.add('activeTab');
    });
  }
}

function changetoolTipText(
  text = {
    active: 'none',
    copy: 'none',
    list: 'none',
    apply: 'none',
    delete: 'none',
    swich: 'none',
  }
) {
  apply_button_tooltip.innerHTML = text.active;
  copy_button_tooltip.innerHTML = text.copy;
  list_button_tooltip.innerHTML = text.list;
  apply_button_tooltip.innerHTML = text.apply;
  delete_button_tooltip.innerHTML = text.delete;
  swich_button_tooltip.innerHTML = text.swich;
}

COMPONENTS.registerListener(function () {
  var idList = COMPONENTS.idList;
  for (id in idList) {
    var listContainer = document.getElementById(idList[id]);
    var lookupTable = COMPONENTS.lookupTable;
    for (key in lookupTable) {
      var elements = listContainer.getElementsByClassName(key);
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          var string = element.innerText;
          if (string == lookupTable[key]) {
            continue;
          } else {
            element.innerHTML = lookupTable[key];
          }
        }
      } else {
        var li = document.createElement('li');
        li.className = key;
        li.innerHTML = lookupTable[key];
        listContainer.append(li);
      }
    }
  }
});
LOCATIONS.registerListener(function () {
  var idList = LOCATIONS.idList;
  for (id in idList) {
    var listContainer = document.getElementById(idList[id]);
    var lookupTable = LOCATIONS.lookupTable;
    for (key in lookupTable) {
      var elements = listContainer.getElementsByClassName(key);
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          var string = element.innerText;
          if (string == lookupTable[key]) {
            continue;
          } else {
            element.innerHTML = lookupTable[key];
          }
        }
      } else {
        var li = document.createElement('li');
        li.className = key;
        li.innerHTML = lookupTable[key];
        listContainer.append(li);
      }
    }
  }
});

ipcRenderer.on('save-doc', function (event, docText) {
  //do what you want with the path/file selected, for example:
  cleanDocumentForSaving();
  var docText = document.getElementById('theDocument').innerHTML;
  ipcRenderer.send('save-doc', { text: docText });
});
ipcRenderer.on('save-doc-complete', function (event, docText) {
  addPageShield();
});
ipcRenderer.on('exportjson-doc', function (event, docText) {
  //do what you want with the path/file selected, for example:
  var docText = create_json();
  ipcRenderer.send('exportjson-doc', { text: docText });
});
ipcRenderer.on('load-doc', function (event, data) {
  //do what you want with the path/file selected, for example:
  var div = document.createElement('div');
  div.innerHTML = data.html;
  pageShield = getTempletElement('pageShield');
  theDocument.innerHTML = '';
  theDocument.appendChild(pageShield);

  var children = div.children;

  while (children.length > 0) {
    theDocument.append(children[0]);
  }

  pageShield.hidden = true;
  setUpTreeView();
});
ipcRenderer.on('base64-reply', function (event, data) {
  //do what you want with the path/file selected, for example:
  var base64 = data;
  var p = document.createElement('p');
  p.align = 'center';
  p.setAttribute('contenteditable', 'false');
  var img = document.createElement('img');
  p.append(img);
  img.src = 'data:image/png;base64,' + base64;

  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(p);
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
});

sendDocToMainProcess();
addEvenetListernToTabbButtons();
