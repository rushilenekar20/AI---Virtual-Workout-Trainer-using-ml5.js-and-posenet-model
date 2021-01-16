
let video;
let poseNet;
let pose;
let skeleton;

let brain;
let trainingBrain;
let model;
let modelName;
let output;

let state = 'waiting';
let tab = 'waiting';
let targeLabel;

let width = 900;
let height = 600;

function collectdata(){
    
    modelName = document.getElementById("class").value ;
    output = document.getElementById("outputs").value ;
   // console.log(modelName);
        var li = document.createElement('li');
        li.textContent = "You have entered Workout : "+modelName + "  .for collecting data ." +"And number of  expected outputs class  are :"+output ;
        document.getElementById("console1").appendChild(li);

         
    let options = {
      inputs: 34,
      outputs: output,
      task: 'classification',
      debug: true
    }
    brain = ml5.neuralNetwork(options);

    var li = document.createElement('li');
    li.textContent = "Model is intialised ";
    document.getElementById("console1").appendChild(li);


        var li = document.createElement('li');
        li.textContent = "To enter data  to perticular class(eg. serially 1, 2 ,3 ...) just press the key on keyboard collecting process of data will be start. ";
        document.getElementById("console1").appendChild(li);
        var li = document.createElement('li');
        li.textContent = "To save the data to for training model just press key  <   s   >";
        document.getElementById("console1").appendChild(li);


   tab = "collecting";
}


function keyPressed() {

  if(tab=='collecting'){
        if (key == 's') {
            brain.saveData(modelName);
            var li = document.createElement('li');
            li.textContent = "To train model go to next tab of training and click training ";
            document.getElementById("console1").appendChild(li);
            
        } else {

            targetLabel = key;
            console.log(targetLabel);
            var li = document.createElement('li');
            li.textContent = "you have entered : <<<"+ targetLabel +">>>  Data collection will start soon";
            document.getElementById("console1").appendChild(li);
            
            
            setTimeout(function() {
        

                console.log('collecting');
                var li = document.createElement('li');
                li.textContent = "Collecting";
                document.getElementById("console1").appendChild(li);

            state = 'collecting';
            setTimeout(function() {
                console.log('not collecting');
            
                var li = document.createElement('li');
                li.textContent = "not Collecting";
                document.getElementById("console1").appendChild(li);
                state = 'waiting';
            }, 10000);
            
            }, 10000);

        }
      }
    
}




function setup() {
//     var ccanvas = createCanvas(width,height);;
//     ccanvas.parent('canvas');
//    video = createCapture(VIDEO);
 
//    video.size(width ,height);
//    video.hide();
  
//   video = createCapture(VIDEO);
//   video.hide();

var ccanvas = createCanvas(900, 600);
   ccanvas.parent('canvas');
  video = createCapture(VIDEO);

  video.size(900 ,600);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

}

function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}


function modelLoaded() {
  console.log('poseNet ready');
  
  var li = document.createElement('li');
  li.textContent = "PoseNet ready";
  document.getElementById("console1").appendChild(li);

}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
}

function TrainModel(){
  
      console.log('model tarining');
      modelName = document.getElementById("Tclass").value ;
      output = document.getElementById("Toutputs").value ;

      var li = document.createElement('li');
      li.textContent = "model training";
      document.getElementById("console1").appendChild(li);
      

      let options = {
          inputs: 34,
          outputs: output,
          task: 'classification',
          debug: true
        }
      

      trainingBrain = ml5.neuralNetwork(options);
      trainingBrain.loadData("../models/"+ modelName+'.json', dataReady);
    
    
    function dataReady() {
      trainingBrain.normalizeData();
      trainingBrain.train({epochs: 50}, finished); 
    }
    
    function finished() {
      console.log('model trained');
      var li = document.createElement('li');
      li.textContent = "model Saved";
      document.getElementById("console1").appendChild(li);
  
      trainingBrain.save();
    }
  
}








function TrainModelButton(){
    
  tab = 'TrainModel';
  console.log('to traingng');
  TrainModel();

}

function loadModelButton(){
  if(tab=='waiting'){
  tab = 'LoadModel';
  }
}
