class SetTable{
    constructor(chapterId, stepNumber, chapterName){
      let setTable = document.createElement('div');
      setTable.classList.add(chapterId);
      setTable.classList.add('mv-table');
      setTable.classList.add('step_table');
      setTable.id = Dev.uuid()
  
      let container = document.createElement('div');
      container.classList.add('container');
      container.classList.add('mv-container');
      
      let tableHeadder = new SetTableHeadder(stepNumber, chapterName);
      let stepDescription = new StepDescription();
  
      setTable.append(container);
      container.append(setTableHeadder);
  
      this.element = setTable;
    }
  }
  class SetTableHeadder{
    constructor(stepNumber, chapterName){
      this.element = document.createElement('div');
      element.classList.add('row');
      element.classList.add('step_table');
      
      let cell1 = document.createElement('div');
      cell1.classList.add('col-6');
      cell1.classList.add('cell');
  
      this.taskOrder_stepNumber = document.createElement('input');
      taskOrder_stepNumber.classList.add('taskOrder_stepNumber');
      taskOrder_stepNumber.setAttribute('value', stepNumber);
      taskOrder_stepNumber.setAttribute('type', "text");
      taskOrder_stepNumber.setAttribute('onchange', "this.setAttribute('value', this.value)");
      
      let cell2 = document.createElement('div');
      cell2.classList.add('col-6');
      cell2.classList.add('cell');
  
      this.moduleChapterName = document.createElement('h1');
      moduleChapterName.classList.add(moduleChapterName)
      moduleChapterName.innerHTML = chapterName;
  
      let actionButton = new ActionButton(["caution","note","warning","copy","delete"]);
  
      this.element.append(cell1);
      this.element.append(cell2);
      cell1.append(this.taskOrder_stepNumber);
      cell2.append(this.moduleChapterName);
      cell2.append(actionButton.element);
  
  
      this.element = setTable;
    }
  }
  class StepDescription{
    constructor(){
      this.element = document.createElement('div');
      element.classList.add('row');
      element.classList.add('stepDescriptionContainer');
      
      let cell1 = new Cell(["col-12"]);
  
      let title = document.createElement('h5');
      title.classList.add('text-left')
      moduleChapterName.innerHTML = '<strong>STEP:</strong>';
  
  
      let row = document.createElement('div');
      row.classList.add('row');
      let col = document.createElement('div');
      col.classList.add('col-12');
  
      let step_description = new EditableList();
      step_description.element.classList.add('step_description');
  
      let actionButton = new ActionButton(["list"]);
  
      this.element.append(cell1.element);
      cell1.element.append(title);
      cell1.element.append(step_description.elemnet);
      cell1.element.append(actionButton.element);
    }
  }
  
  class ActionSection{
    constructor(){
      this.element = document.createElement('div');
      let actionHeader = new Row(1);
      let h4 = document.createElement('h4')
      h4.innerHTML = "ACTION(S)";
      actionHeader.cells[0].append(h4);
      actionHeader.cells[0].setAttribute("style","background-color: #7facf1; color: rgb(0,0,0);");
  
  
      let actionTableHeader = new Row(3);
      let headerText = ["DESCRIPTION/STATE(S)","TAG TEXT","VOICE OVER"];
      for(let i=0; i< actionTableHeader.cells.length;i++){
        let h6 = document.createElement('h6')
        h6.innerHTML = headerText[i];
        actionTableHeader.cells[i].append(h6);
        actionTableHeader.cells[i].setAttribute("style","background-color: #acc8f1; color: rgb(0,0,0);");
      }
  
      let actionRow = document.createElement('div');
      actionRow.classList.add("action-row");
      
      let row = new Row(3);
      let className =  ["description_state", "tag_text", "voice_over"];
      for(let i=0; i< row.cells.length;i++){
        let el = new EditableList();
        let cell = row.cells[i];
        cell.append(el);
        cell.classList.add(className[i]);
      }
  
      let actionButton = new ActionButton(["copy","delete"]);
      row.cells[row.cells.length-1].append(actionButton.element);
    }
  }
  
  
  class Row{
    constructor(numCol){
      this.elemnet = document.createElement('div');
      this.elemnet.classList.add('row');
      let colSize = 12/numCol;
      for(let i=0; i<numCol; i++){
        let cell = new Cell('col-' +colSize.toString());
        this.elemnet.append(cell);
      }
      this.cells = this.element.children;
    }
  }
  
  class Cell{
    constructor(classNameList){
      this.elemnet = document.createElement('div');
      this.elemnet.classList.add('cell');
      for(let i=0; i<classNameList.length; i++){
        className = classNameList[i];
        this.elemnet.classList.add(className);
      }
    }
  }
  
  class EditableList{
    constructor(){
      this.element = document.createElement('ul');
      this.element.classList('editableList');
      this.element.setAttribute("spellcheck", "true");
      this.element.setAttribute("contenteditable", "true");
      let li = document.createElement('li');
      li.innerHTML = "N/A";
      this.element.append(li);
    }
  }
  