var state={
    mailbox: 'Inbox',
    max: [50, 50, 50, 50],
    page: 0,
    idArray: [],
    showingEmail: false,
    currentEmail: '',
    toMove: [],
    composing: false
}

function getIds(){
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            var collect=xhr.responseText;
            state.idArray=collect.split(';');
            state.idArray.pop();
        }
    }
    xhr.open("GET", "getids?mailbox="+state.mailbox, true);
    xhr.send();
}

function setMaxPages(){
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            var collect=xhr.responseText;
            for(var i=0; i<4; i++){
                state.max[i]=collect[i];
            }
        }
    }
    xhr.open("GET", "setMaxPage", true);
    xhr.send();
}

function getMailNew(div){
    state.composing=false;
    document.documentElement.style.setProperty('--display', 'block');
    var elements=document.getElementsByClassName('link');
    for (var i=0; i<4; i++){
        elements[i].style.color='#FF7F50';
    }
    state.showingEmail=false;
    getIds();
    state.mailbox= div;
    state.page=0;

    document.getElementById(state.mailbox).style.color='#556B2F';
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            document.getElementById('email').innerHTML=xhr.responseText;
        }
    }
    xhr.open("GET", "retrieveemaillist?mailbox="+state.mailbox+"&page="+state.page, true);
    xhr.send();
}

function displayEmail(identity){
    state.composing=false;
    document.documentElement.style.setProperty('--display', 'block');
    state.currentEmail=identity;
    state.showingEmail=true;
    getIds();
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            document.getElementById('email').innerHTML=xhr.responseText;
        }
    }
    xhr.open("GET", "openemail?id="+identity, true);
    xhr.send();
}

function getMail(div){
    state.composing=false;
    document.documentElement.style.setProperty('--display', 'block');
    state.showingEmail=false;
    getIds();
    state.mailbox= div;
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            document.getElementById('email').innerHTML=xhr.responseText;
        }
    }
    xhr.open("GET", "retrieveemaillist?mailbox="+state.mailbox+"&page="+state.page, true);
    xhr.send();
}

function nextPage(){
    if(!state.composing){
        var maxNumber=0;
        if (state.showingEmail){
            maxNumber=state.idArray.length;
            for(var i=0; i<maxNumber; i++){
                if(state.idArray[i]===state.currentEmail){
                    if(i+1<maxNumber){
                        displayEmail(state.idArray[i+1]);
                    }
                    break;
                }
            }
        }else{
            if(state.mailbox==='Inbox'){
                maxNumber=state.max[0];
            }else if(state.mailbox==='Important'){
                maxNumber=state.max[1];
            }else if(state.mailbox==='Sent'){
                maxNumber=state.max[2];
            }else if(state.mailbox==='Trash'){
                maxNumber=state.max[3];
            }
            if(state.page<maxNumber){
                state.page++;
                getMail(state.mailbox);
            }
        }
    }
    
    
}

function prevPage(){
    if(!state.composing){
        if(state.showingEmail){
            maxNumber=state.idArray.length;
            for(var i=0; i<maxNumber; i++){
                if(state.idArray[i]===state.currentEmail){
                    if(i>0){
                        displayEmail(state.idArray[i-1]);
                    }
                    break;
                }
            }
        }else{
            if (state.page>0){
                state.page--;
                getMail(state.mailbox);
            }
        }
    } 
}

function addToList(checkbox){
    if(checkbox.checked== true){
        state.toMove.push(checkbox.id);
    }else{
        for(var i=0; i<state.toMove.length; i++){
            if(state.toMove[i]==checkbox.id){
                state.toMove.splice(i, 1);
            }
        }
    }
}

function moveTo(div){
    var reqBody={
        ids: state.toMove,
        location: div
    }

    var toSend=JSON.stringify(reqBody);
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            setMaxPages();
            getMailNew(state.mailbox);
        }
    }
    xhr.open("POST",'move', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(toSend);
    
}

function composeEmail(){
    state.composing=true;
    document.documentElement.style.setProperty('--display', 'none');
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            document.getElementById('email').innerHTML=xhr.responseText;
        }
    }
    xhr.open("GET", "compose", true);
    xhr.send();
}

function sendEmail(){
    state.composing=false;
    document.documentElement.style.setProperty('--display', 'block');
    var recipient=document.getElementById('recip').value;
    var title=document.getElementById('titl').value;
    var content=document.getElementById('cont').value;
    var xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4 && xhr.status==200){
            getMailNew('Inbox');
        }
    }
    xhr.open("GET", "sendemail?recipient="+recipient+"&title="+title+"&content="+content, true);
    xhr.send();
}