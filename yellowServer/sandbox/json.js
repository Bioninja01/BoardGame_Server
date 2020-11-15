function json_create(id) {
  let d = document.getElementById(id);
  var obj_document = [];
  let childern = d.children;
  for (let i = 0; i < childern.length; i++) {
    let node = childern[i];
    if (node.nodeName == 'META') {
      continue;
    }
    if (node.className == 'coverPage') {
      continue;
    }

    let type = node.getElementsByTagName('h1')[0].innerText;

    switch (type) {
      case 'Module Introduction':
        {
          let obj = data_moduleIntroduction(node);
          obj_document.push(obj);
        }
        break;
      case 'MODULE TASK(S)':
        {
          let obj = data_moduleTasks(node);
          obj_document.push(obj);
        }
        break;
      case 'WARNING':
      case 'CAUTION':
      case 'NOTE':
        {
          let obj = data_sign(node);
          obj_document.push(obj);
        }
        break;
      default:
        {
          let obj = data_step(node);
          obj_document.push(obj);
        }
        break;
    }
  }
  return obj_document;
}
function data_sign(element) {
  let obj = {};
  let type = element.getElementsByTagName('h1')[0].innerText;
  let textSections = element.getElementsByClassName('editableList');

  obj['type'] = type;
  obj['description'] = textSections[0].innerText;
  obj['media'] = textSections[1].innerText;
  return obj;
}
function data_moduleIntroduction(element) {
  let obj = {};
  let type = element.getElementsByTagName('h1')[0].innerText;
  let passingPercentage = element.getElementsByTagName('input')[0].value;

  let textSections = element.getElementsByClassName('editableList');

  obj['type'] = type;
  obj['passingPercentage'] = passingPercentage;
  obj['stagingTitle'] = textSections[0].innerText;
  obj['disclaimer'] = textSections[1].innerText;
  obj['startText_voicOver'] = textSections[2].innerText;
  return obj;
}
function data_moduleTasks(element) {
  let obj = {};
  let type = element.getElementsByTagName('h1')[0].innerText;
  let tasks = [];
  let moduleTasks = element.getElementsByTagName('moduleChapter');

  for (let data of moduleTasks) {
    let task = {};
    let inputs = data.getElementsByTagName('input');
    task['taskName'] = inputs[0].value;
    task['steps'] = inputs[1].value;
    task['passingPercentage'] = inputs[2].value;
    task['wight'] = inputs[3].value;
    tasks.push(task);
  }

  obj['type'] = type;
  obj['tasks'] = tasks;
  return obj;
}
function data_step(element) {
  let obj = {};
  let type = element.getElementsByTagName('h1')[0].innerText;
  let passingPercentage = element.getElementsByTagName('input')[0].value;

  let actions = [];
  let action_row = element.getElementsByClassName('action-row');

  for (let data of action_row) {
    let task = {};
    let textData = data.getElementsByClassName('editableList');
    let actionElement = textData[0];

    let text = actionElement.getElementsByTagName('span');
    if (text.length > 0) {
      text = text[0].innerText;
    } else {
      text = '';
    }
    let obj_action = {};
    switch (text) {
      case 'ensure':
        {
          let select = actionElement.getElementsByTagName('select')[0];
          let input = actionElement.getElementsByTagName('input')[0];
          obj_action['type'] = 'ensure';
          obj_action['component'] = select.children[select.selectedIndex].value;
          obj_action['value'] = input.value;
        }
        break;
      case 'set':
        {
          let select = actionElement.getElementsByTagName('select')[0];
          let input = actionElement.getElementsByTagName('input')[0];
          obj_action['type'] = 'set';
          obj_action['component'] = select.children[select.selectedIndex].value;
          obj_action['value'] = input.value;
        }
        break;
      case 'verify':
        {
          let select = actionElement.getElementsByTagName('select')[0];
          obj_action['type'] = 'verify';
          obj_action['component'] = select.children[select.selectedIndex].value;
        }
        break;
      case 'navigate':
        {
          let select = actionElement.getElementsByTagName('select')[0];
          obj_action['type'] = 'navigate';
          obj_action['location'] = select.children[select.selectedIndex].value;
        }
        break;
      case 'read':
        {
          obj_action['type'] = 'read';
        }
        break;
      case 'wait':
        {
          let input = actionElement.getElementsByTagName('input')[0];
          obj_action['type'] = 'wait';
          obj_action['value'] = input.value;
        }
        break;
      case 'hold':
        {
          let select = actionElement.getElementsByTagName('select')[0];
          let inputs = actionElement.getElementsByTagName('input');
          let position = inputs[0].value;
          let time = inputs[1].value;
          obj_action['type'] = 'hold';
          obj_action['component'] = '';
          obj_action['position'] = position;
          obj_action['time'] = time;
        }
        break;
      case 'require':
        {
          let inputs = actionElement.getElementsByTagName('input');
          let item = inputs[0].value;
          let value = inputs[1].value;
          obj_action['type'] = 'require';
          obj_action['item'] = item;
          obj_action['value'] = value;
        }
        break;
    }

    task['action'] = obj_action;
    task['description'] = textData[1].innerText;
    task['voiceOver'] = textData[2].innerText;
    actions.push(task);
  }

  let stepNumber = element.getElementsByClassName('taskOrder_stepNumber')[0]
    .value;
  let taskName = element.getElementsByClassName('taskOrder-number')[0]
    .innerText;
  let step_description = element.getElementsByClassName('step_description')[0]
    .innerHTML;
  let component = element.getElementsByClassName('component')[0].innerText;
  let location_personnel = element.getElementsByClassName(
    'location_personnel'
  )[0].innerText;
  let completion_range = element.getElementsByClassName('completion_range')[0];

  let start = completion_range.getElementsByClassName('start')[0].value;
  let end = completion_range.getElementsByClassName('end');

  if (end < 0) {
    end = end[0].value;
  } else {
    end = null;
  }

  let score_weight_container = element.getElementsByClassName(
    'score_weight'
  )[0];
  let score_weight = score_weight_container.getElementsByTagName('input')[0];

  let textSections = element.getElementsByClassName('editableList');

  let media = textSections[textSections.length - 1].innerHTML;
  obj['type'] = 'step';
  obj['id'] = element.id;
  obj['stepNumber'] = stepNumber;
  obj['taskName'] = taskName;
  obj['step_description'] = step_description;
  obj['actions'] = actions;
  obj['component'] = component;
  obj['location_personnel'] = location_personnel;
  obj['completion_range'] = { start: start, end: end };
  obj['score_weight'] = score_weight;
  obj['media'] = media;
  return obj;
}

const regex = /[(]([^\0)]*)[)]([+]*)([*][\d]*)?([>]*){1}|([a-zA-Z\d]+)+([.]+[_a-zA-Z-\d]+)?([.]+[_a-zA-Z-\d]+)*([>]*)*([+]*)*([*][\d])*([+])*/gm;
const str = `div.stepTable>div.container>div.row*5+(div.actionRow>div.bob)*5div*5`;

function genreate_moduleIntroduction() {
  const table = `div.mv-moduleInformation>div.container`;
  const table_title = `div.row.blue>div.col-xl-12.cell>h1.text-center.sign_title`;
  const passingPercentage = `div.row>div.col-xl-12.cell>h6.title+ul.editableList`;
  const stagingTitle = `div.row>div.col-xl-12.cell>h6.title+ul.editableList`;
  const disclaimer = `div.row>div.col-xl-12.cell>h6.title+ul.editableList`;
  const startTextvoiceOver = `div.row>div.col-xl-12.cell>h6.title+ul.editableList`;

  let element_table = genreate_html(table).firstElementChild;
  let container = element_table.firstElementChild;
  let element_table_title = genreate_html(table_title);
  let element_passingPercentage = genreate_html(passingPercentage);
  let element_stagingTitle = genreate_html(stagingTitle);
  let element_disclaimer = genreate_html(disclaimer);
  let element_startTextvoiceOver = genreate_html(startTextvoiceOver);

  header = element_table_title.getElementsByTagName('h1')[0];
  header.innerHTML = 'Module Introduction';
  header = element_passingPercentage.getElementsByTagName('h6')[0];
  header.innerHTML = 'Passing Percentage:';
  header = element_stagingTitle.getElementsByTagName('h6')[0];
  header.innerHTML = 'STAGING TITLE:';
  header = element_disclaimer.getElementsByTagName('h6')[0];
  header.innerHTML = 'DISCLAIMER:';
  header = element_startTextvoiceOver.getElementsByTagName('h6')[0];
  header.innerHTML = 'START TEXT and VOICE OVER:';

  container.append(element_table_title.firstElementChild);
  container.append(element_passingPercentage.firstElementChild);
  container.append(element_stagingTitle.firstElementChild);
  container.append(element_disclaimer.firstElementChild);
  container.append(element_startTextvoiceOver.firstElementChild);
  return element_table;
}
function genreate_moduleTasks() {
  const table = `div.mv-tasks>div.container`;
  const table_title = `div.row.blue>div.col-xl-12.cell>h1.text-center.sign_title`;
  const taskRow = `div.row>(div.col-5>strong.t+h6.taskName)+(div.col-2>strong.t+h6.taskName)+(div.col-2>strong.t+h6.taskName)+(div.col-2>strong.t+h6.taskData)`;

  let element_table = genreate_html(table).firstElementChild;
  let container = element_table.firstElementChild;
  let element_table_title = genreate_html(table_title);
  let element_taskRow = genreate_html(taskRow);

  let headers = element_table_title.getElementsByTagName('h1');
  headers[0].innerHTML = 'MODULE TASK(S)';

  headers = element_taskRow.getElementsByTagName('strong');
  headers[0].innerHTML = 'Task Name';
  headers[1].innerHTML = 'Steps';
  headers[2].innerHTML = 'Passing Percentage';
  headers[3].innerHTML = 'Weight';

  container.append(element_table_title.firstElementChild);
  container.append(element_taskRow.firstElementChild);
  return element_table;
}
function genreate_sign(type) {
  const table = `div.container.mv-table`;
  const sign_title = `div.row>div.col-xl-12.cell>h1.text-center.sign_title`;
  const sign_description = `div.row>div.col-md-12>ul.editableList`;
  const sign_media = `div.row>div.col-12.cell>h5.text+div.row>div.col-md-12>ul.editableList`;

  let element_table = genreate_html(table).firstElementChild;
  let element_sign_title = genreate_html(sign_title);
  let element_sign_description = genreate_html(sign_description);
  let element_sign_media = genreate_html(sign_media);

  let banner = element_sign_title.getElementsByClassName('cell')[0];
  let header = element_sign_title.getElementsByClassName('text-center')[0];
  header.innerHTML = type;
  element_table.append(element_sign_title.firstElementChild);
  element_table.append(element_sign_description.firstElementChild);
  element_table.append(element_sign_media.firstElementChild);

  switch (type) {
    case 'WARNING':
      banner.setAttribute('style', 'background-color: #9a1d1d;');
      header.innerHTML = type;
      break;
    case 'NOTE':
      banner.setAttribute('style', 'background-color: black;');
      break;
    case 'CAUTION':
      banner.setAttribute('style', 'background-color: #b59801;');
      break;
    default:
      break;
  }
  return element_table;
}
function genreate_setTable() {
  const table = `div.mv-table.step_table>div.container`;
  const title = `div.row.blue>(div.col-6.cell>input.taskOrder_stepNumber)+div.col-6.cell>h1.taskOrder`;
  const step_description = `div.row>div.col-12.cell>(h5>strong.bold)+(div.row>div.col-12>ul.step_description.editableList)`;
  const actionTitle = `div.row.blueLight>div.col-12.cell>h4.text-center`;
  const actionHeaders = `div.row>(div.col-4.cell.blueLightLight>h6.text-center)+(div.col-4.cell.blueLightLight>h6.text-center)+(div.col-4.cell.blueLightLight>h6.text-center)`;
  const actionRow = `div.action-row>div.row.cell>(div.col-4.cell.action>ul.editableList)+(div.col-4.cell.description>ul.editableList)+(div.col-4.cell.voice_over>ul.editableList)`;
  const dataSum = `div.row>(div.col-6.cell>h5.text-left+ul.component)+(div.col-6.cell>h5.text-left+ul.location_personnel)`;
  const unguidedTitle = `div.row.green>div.col-12.cell>h4.text-center`;
  const unguidedRow = `div.row.unguided_assessment>(div.col-3.cell.greenLight>h6.text-center)+(div.col-3.cell>div.>span.start)+(div.col-3.cell.greenLight>h6.text-center)+(div.col-3.cell>div.score_weight>input.)`;
  const mediaRow = `div.row>(div.col-12.cell>h5.text+div.row>div.col-md-12>ul.editableList)`;
  const bottomRow = `div.row.blueBar>div.col-12.cell`;
  let headers = undefined;
  let table_element = genreate_html(table);
  let element_title = genreate_html(title);
  let element_step_description = genreate_html(step_description);
  headers = element_step_description.getElementsByTagName('h5');
  headers[0].innerHTML = 'STEP:';

  let element_actionTitle = genreate_html(actionTitle);
  element_actionTitle.getElementsByTagName('h4')[0].innerHTML = 'ACTION(S):';

  let element_actionHeaders = genreate_html(actionHeaders);
  headers = element_actionHeaders.getElementsByTagName('h6');

  headers[0].innerHTML = 'Action';
  headers[1].innerHTML = 'DESCRIPTION/STATE(S)';
  headers[2].innerHTML = 'VOICE OVER';

  let element_actionRow = genreate_html(actionRow);
  let element_dataSum = genreate_html(dataSum);

  headers = element_dataSum.getElementsByTagName('h5');
  headers[0].innerHTML = 'COMPONENT(S):';
  headers[1].innerHTML = 'LOCATION(S)/PERSONNEL:';
  let element_unguidedTitle = genreate_html(unguidedTitle);
  element_unguidedTitle.getElementsByTagName('h4')[0].innerHTML =
    'UNGUIDED ASSESSMENT';

  let element_unguidedRow = genreate_html(unguidedRow);

  headers = element_unguidedRow.getElementsByTagName('h6');
  headers[0].innerHTML = 'ACOMPLETION RANGE:';
  headers[1].innerHTML = 'SCORE WEIGHT:';
  let element_mediaRow = genreate_html(mediaRow);

  headers = element_mediaRow.getElementsByTagName('h5');
  headers[0].innerHTML = 'Media:';
  let element_bottomRow = genreate_html(bottomRow);

  let container = table_element.getElementsByClassName('container')[0];
  container.append(element_title.firstElementChild);
  container.append(element_step_description.firstElementChild);
  container.append(element_actionTitle.firstElementChild);
  container.append(element_actionHeaders.firstElementChild);
  container.append(element_actionRow.firstElementChild);
  container.append(element_dataSum.firstElementChild);
  container.append(element_unguidedTitle.firstElementChild);
  container.append(element_unguidedRow.firstElementChild);
  container.append(element_mediaRow.firstElementChild);
  container.append(element_bottomRow.firstElementChild);

  return table_element.firstElementChild;
}

function populate_moduleIntroduction(obj, element) {
  let type = element.getElementsByTagName('h1')[0].innerText;
  let passingPercentage = element.getElementsByTagName('input')[0].value;

  let textSections = element.getElementsByClassName('editableList');

  obj['type'] = type;
  obj['passingPercentage'] = passingPercentage;
  obj['stagingTitle'] = textSections[0].innerText;
  obj['disclaimer'] = textSections[1].innerText;
  obj['startText_voicOver'] = textSections[2].innerText;
  return obj;
}

function populate_step(obj, element) {
  let type = element.getElementsByTagName('h1')[0];
  let passingPercentage = element.getElementsByTagName('input')[0];

  let actions = [];
  let action_row = element.getElementsByClassName('action-row')[0];

  const actionRow = `div.action-row>div.row.cell>(div.col-4.cell.action>ul.editableList)+(div.col-4.cell.description>ul.editableList)+(div.col-4.cell.voice_over>ul.editableList)`;

  for (let i = 0; i < obj['actions'].length; i++) {
    let task = obj['actions'][i];
    let editableList = action_row.getElementsByClassName('editableList');

    let actionObj = task['action'];
    let keys = Object.keys(actionObj);

    let text = '';
    for (let k of keys) {
      text += actionObj[k] + ' ';
    }
    editableList[0].innerHTML = text;
    editableList[1].innerHTML = task['description'];
    editableList[2].innerHTML = task['voiceOver'];

    let element_actionRow = genreate_html(actionRow);
    if (i < obj['actions'].length - 1) {
      action_row.parentNode.insertBefore(
        element_actionRow,
        action_row.nextSibling
      );
      action_row = element_actionRow;
    }
  }

  let stepNumber = element.getElementsByClassName('taskOrder_stepNumber')[0];
  let taskOrder = element.getElementsByClassName('taskOrder')[0];
  let step_description = element.getElementsByClassName('step_description')[0];
  let component = element.getElementsByClassName('component')[0];
  let location_personnel = element.getElementsByClassName(
    'location_personnel'
  )[0];
  let start = element.getElementsByClassName('start')[0];
  let end = element.getElementsByClassName('end');
  let score_weight_container = element.getElementsByClassName(
    'score_weight'
  )[0];
  let score_weight = score_weight_container.getElementsByTagName('input')[0];

  element.id = obj['id'];
  stepNumber.value = obj['stepNumber'];
  taskOrder.innerHTML = obj['taskName'];
  step_description.innerHTML = obj['step_description'];
  step_description.setAttribute('style', 'list-style-type:none;');

  text = obj['component'].split('\n');
  for (let line of text) {
    let li = document.createElement('li');
    li.innerHTML = line;
    component.append(li);
  }
  text = obj['location_personnel'].split('\n');
  for (let line of text) {
    let li = document.createElement('li');
    li.innerHTML = line;
    location_personnel.append(li);
  }

  start.value = obj['completion_range'].start;
  if (end < 0) {
    end[0].value = obj['completion_range'].end;
  } else {
    end = null;
  }

  let textSections = element.getElementsByClassName('editableList');

  let media = textSections[textSections.length - 1];

  media.innerHTML = obj['media'];
}

function genreate_html(pattern) {
  let m;
  let tempElement = document.createElement('div');
  let currentElement = tempElement;

  matches = [];
  while ((m = regex.exec(pattern)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    matches.push(m);
  }

  for (let mm of matches) {
    let groups = [];

    mm.forEach((match, groupIndex) => {
      if (match != undefined && match != '' && groupIndex != 0) {
        groups.push(match);
      }
    });

    let element = null;
    //look at full match
    if (mm[0][0] == '(') {
      element = genreate_html(mm[1]);
      currentElement.append(element.firstElementChild);
    } else if (groups.length < 2) {
      continue;
    }
    if (element == null) {
      element = document.createElement(groups[0]);
      currentElement.append(element);
    }
    for (let group of groups) {
      if (group[0] == '.') {
        let clazzName = group;
        clazzName = clazzName.replace('.', '');
        element.classList.add(clazzName);
      }
      if (group[0] == '>') {
        currentElement = element;
      }
      if (group[0] == '*') {
        let num = group.replace('*', '');
        num = Number(num);
        for (let j = 1; j < num; j++) {
          let clone = element.cloneNode(true);
          currentElement.append(clone);
        }
      }
      if (group[0] == '+') {
        //do nothing
      }
    }
  }
  return tempElement;
}

function json_parse(JsonData) {}

ipcRenderer.on('exportjson-doc', function (event, docText) {
  //do what you want with the path/file selected, for example:
  var docText = json_create('theDocument');
  docText = JSON.stringify(docText);
  ipcRenderer.send('exportjson-doc', { text: docText });
});
