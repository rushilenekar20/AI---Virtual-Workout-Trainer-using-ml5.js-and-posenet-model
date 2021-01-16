

let video;
let poseNet;
let pose;
let skeleton;

let output;
let modelName; 

let brain;
let poseLabel = "";

let mytimercount = 0;

let bodyPartsQueue = ["leftShoulder" ,"rightShoulder" ,"leftElbow" ,"rightElbow" , "leftWrist","rightWrist" , "leftHip" ,"rightHip",
"leftKnee" , "rightKnee" , "leftAnkle" , "rightAnkle"];
let user =[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];

let angleBisectIndex = [ [0,1], [0,2] , [2,4], [1,3], [3,5], [0,6], [1,7], [6,8], [8,10], [7,9], [9,11]];

let angleUserValues =[0,0,0,0,0,0,0,0,0,0,0,0];

           //  ["workout", "outputs" , num_sets , num_reps , totalsets   , totalsets  , totalsets , rightset ,   rightset,  rightset]    ]
let workouts =[['squat' ,   2,         3 ,         6,            0,          0,            0,           0,           0,          0],
               ['pushup',    2 ,        3 ,         6,           0,          0,            0,           0,          0,          0],
               ['situp',    2 ,        3 ,         6,           0,          0,            0,           0,          0,          0],
               ['standingclimb' , 2 ,       3,          6,           0,          0,            0,           0,          0,          0]];

let num_sets = 0;
let max_num_sets = 0;

let num_reps = 0;
let max_num_reps = 0;
let repsflag = false;

let right_reps_num =0;

let tab = "";
let Workout_num =0;

let current_document_id_ass_reps ="";
let current_document_id_completed_reps ="";

function setup() {
 
  var ccanvas = createCanvas(900, 600);
    ccanvas.parent('canvas');
    video = createCapture(VIDEO);
  
    video.size(900 ,600);
    video.hide();
  
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);
  
    
  }
  
  function modelLoaded() {
    console.log('poseNet ready');
  }


  function gotPoses(poses) {
    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
    }
  }
  
  

function startClassify(modelName , output ,Workout_number){


  // modelName = document.getElementById("class").value ;
  // output = document.getElementById("outputs").value ;

  // modelName = 'squat';
  // output = 2;

  setImages(modelName);


  Workout_num = Workout_number;

 current_document_id_ass_reps =  workouts[Workout_num][0] + "-reps";
 current_document_id_completed_reps =workouts[Workout_num][0] + "-completed-reps";
 console.log(current_document_id_ass_reps);
 document.getElementById(current_document_id_ass_reps).textContent = workouts[Workout_num][3];

 current_document_id_ass_sets =  workouts[Workout_num][0] + "-sets";
 current_document_id_completed_sets =workouts[Workout_num][0] + "-completed-sets";
 console.log(current_document_id_ass_sets);
 document.getElementById(current_document_id_ass_sets).textContent = workouts[Workout_num][2];

 

  num_sets = 0;
  max_num_sets = workouts[Workout_num][2];

  num_reps = 0;
  max_num_reps = workouts[Workout_num][3];
  repsflag = false;
  right_reps_num = 0;


  tab = "";

  let options = {
    inputs: 34,
    outputs: output,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  console.log(modelName);
  let a = 'model';
  const modelInfo = {
    // model: "../models/"+ modelName+'_DATA.json',
    // metadata: "../models/"+ modelName+'_DATA_meta.json',
    // weights: '../models/PUSHUPS_DATA.weights.bin',

    model: '../models/'+modelName+'/model.json',
    metadata: '../models/'+modelName+'/model_meta.json',
    weights: '../models/'+modelName+'/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}


function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}



function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {

  if(num_sets < max_num_sets){

    if (results[0].confidence > 0.75) {
      poseLabel = results[0].label.toUpperCase();
      if(poseLabel == '2' && repsflag ){
        num_reps ++;
        document.getElementById(current_document_id_completed_reps).textContent = num_reps;
        workouts[Workout_num][num_sets + 3] = num_reps;
        repsflag = false;
        if(num_reps > max_num_reps ){
          num_sets++;
          document.getElementById(current_document_id_completed_sets).textContent = num_sets;
          num_reps = 0;
        } 
      } 
      else if(poseLabel == '1') repsflag = true;
    }
    //console.log(results[0].confidence);
    classifyPose();

  }
  else {
    tab = 'endofset';
  }
  
}





function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      // line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      //console.log(pose.keypoints[i]);

      let part = pose.keypoints[i].part;
      //console.log(part);
      //console.log(bodyPartsQueue.indexOf(part));
      //console.log('\n');
      if(bodyPartsQueue.indexOf(part) !=-1 ){
        user[bodyPartsQueue.indexOf(part)][0] =pose.keypoints[i].position.x;
        user[bodyPartsQueue.indexOf(part)][1] =pose.keypoints[i].position.y;
  
      }
      


      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      // ellipse(x, y, 16, 16);
    }


    let Trainer = getAngleMatrixPoselabel(workouts[Workout_num][0], poseLabel);
     // let Trainer =  [-177.0035653052148, 52.96063352089298, 124.05474547098598, 131.4716469213609, 61.857345770381, 98.76660831022956, 85.98698099793035, 91.12195653949918, 87.14126666783046, 92.58621455745373, 82.12885999638678, 0];
    
   // let Trainer = [174.64312311809982, 69.53778684789786, 89.77495008335046, 104.05599353911487, 92.18559648338066, 99.85785508345825, 76.14903878571451, 79.17080908761324, 95.73438592016154, 100.60119004353714, 92.98789493924744, 0];

    //let Trainer = [177.9154325051088, 81.56185775727498, 79.10336465461704, 96.5458541331125, 98.99271569235343, 96.69958646308521, 83.00230556210666, 87.34050850903161, 87.95823471792166, 90.15194654227643, 91.77123463924589, 0];
    let trainercounter = 0;
    
      for( i =0 ;i<11 ;i++){
    
      let xName =  angleBisectIndex[i][0];
      let yName =  angleBisectIndex[i][1];
  
      //console.log(bodyParts[xName]);
      let x1 = user[xName][0];
      let y1 = user[xName][1];
      let x2 = user[yName][0];
      let y2 = user[yName][1];
  
      // console.log(x1 ," " , x2, " " , y1," ", y2);
      angleUserValues[i] =( Math.atan2(y2-y1 , x2-x1) * 180 / Math.PI);
      
      if(Trainer[i] +10  >= angleUserValues[i] && Trainer[i] - 10 <= angleUserValues[i]){
       

      // let angle1 = ( Math.atan2(y3-y1 , x3-x1)  *180 /Math.PI);
      // print(" model predicted angle : " ,angle1);

        //console.log("galat hai bhai ");
        trainercounter++;

      }
      else {
        let theta = Trainer[i];
              
        let a = x2 - x1;
        let b = y2 - y1;

        let r =  Math.sqrt( a*a + b*b );

        let x3 = x1 + r * Math.cos(theta ), y3= y1 + r * Math.sin( theta );
        
        ellipse(x3, y3, 12,12);
        line(x1, y1, x3, y3);

      }
     
  
      }

      if(trainercounter > 8 ){
        //console.log("galat hai bhai ");
         
       }
       else {
        // console.log("sahi hai bhai"); 
       }
      //console.log(poseLabel);
      mytimercount ++; 

      if(mytimercount == 500 ){
        
     console.log("angleuserValues");
     console.log(angleUserValues);
     console.log("angleuserTrainer");
      console.log(Trainer);
      console.log('\n\n');

      }

  }
  pop();
  // console.log(poseLabel);




  fill(255, 0, 255);
  noStroke();
  textSize(202);
  textAlign(CENTER, CENTER);
  text(poseLabel, 100, height -100 );
  textSize(30);
  text("Sets" , 70,30);
  textSize(50);
  text (num_sets , 50 , 70);
  textSize(30);
  text("Reps" , 160,30);
  textSize(50);
  text (num_reps , 150 , 70);


  if(tab == 'endofset'){
    textSize(100);
    text("End of set " ,width / 2,height / 2);
    
  }
}















function getAngleMatrixPoselabel(modelName,poseLabel){

  let toReturnTrainerMatrix = [];

  switch (modelName) {
    case 'squat':
      switch (poseLabel) {
        case '1':
          toReturnTrainerMatrix= [177.9154325051088, 81.56185775727498, 79.10336465461704, 96.5458541331125, 98.99271569235343, 96.69958646308521, 83.00230556210666, 87.34050850903161, 87.95823471792166, 90.15194654227643, 91.77123463924589, 0];
          break;
        case '2':
          toReturnTrainerMatrix= [174.64312311809982, 69.53778684789786, 89.77495008335046, 104.05599353911487, 92.18559648338066, 99.85785508345825, 76.14903878571451, 79.17080908761324, 95.73438592016154, 100.60119004353714, 92.98789493924744, 0];
          break;
  
      }
      break;

    case 'pushup':
      switch (poseLabel) {
        case '1':
          toReturnTrainerMatrix= [-152.4806914697912, 128.2632400007677, 111.96812176509185, 113.49254445446198, 100.01681292748945, 137.55212741409986, 141.9614011636471, 81.30745059665419, 85.91178626252936, 28.44480762547197, 80.75129127728741, 0];
          break;
        case '2':
          toReturnTrainerMatrix= [172.77982477780617, 89.07088941638978, 34.015977029326706, 108.37766827928287, -48.74839781182996, 109.2337695352705, 95.65215676251414, 108.702758812796, 86.37808436613304, 99.69922399047859, 82.78463252857948, 0];
          break;
  
      }
      break;

    case 'situp':
      switch (poseLabel) {
        case '1':
          toReturnTrainerMatrix= [-179.97943965584582, 85.67909160389254, 85.96565797924042, 93.6912455331234, 106.71632584438652, 102.7852737039573, 82.7595491069374, 66.8936667343482, 100.68551351063643, 95.60987845030171, 88.52385444483527, 0];
          break;
        case '2':
          toReturnTrainerMatrix= [-177.64159900486368, 48.43128410741324, 53.94887642719744, 125.6112005082176, 118.65324920945778, 106.32262077662084, 91.04533215741338, -45.401851199158166, 95.52229614400356, 88.11676316634511, 89.15618884603099, 0];
          break;
  
      }  
       break;

    case 'standingclimb':
      switch (poseLabel) {
        case '1':
          toReturnTrainerMatrix= [-178.74640370931849, 80.94732313687938, 86.32797560581739, 100.33383143668432, 95.03638274827235, 99.12113088446618, 84.19799219759591, 90.61137909146333, 92.5839528119034, 86.16136996924394, 99.09916397870482, 0];
          break;
        case '2':
          toReturnTrainerMatrix= [-179.29487183803187, 71.97259388104386, 71.67240782811474, 113.14091393294336, 110.74363357386396, 101.21792612101045, 86.97968078231702, 98.94966413663217, 100.74300656529635, 89.12732222802714, 94.89256613844833, 0];
          break;
  
      }
       break;

  }
     
    return toReturnTrainerMatrix;
}




function giveSummary(){
 

  for(var i =1;i<=workouts[Workout_num][2];i++){

    addDataToElements("summary-output"  , workouts[Workout_num][0] , i,workouts[Workout_num][i + 3],4);

  }



  addDataToElements("previous"  , "squats" , 0,18,7);
  addDataToElements("improvement"  , "squats" , 0,18,12);



}


function addDataToElements(idname , workoutName , setnumber ,totalreps ,totalrightreps){

  const newDiv = document.createElement("div");



  
  const orederdList = document.createElement("ul");

  const l1 = document.createElement("li");
  l1.textContent = workoutName;
  // "Squats ";

  const l1u = document.createElement("ul");

  
  if(setnumber != 0){
  const l1u1 = document.createElement("li");
  l1u1.textContent = "sets :" + setnumber;
  l1u.appendChild(l1u1);
  }

  const l1u2 = document.createElement("li");
  l1u2.textContent = "Total reps :" + totalreps;
  l1u.appendChild(l1u2);

  const l1u3 = document.createElement("li");
  l1u3.textContent = " Total Right Reps :" + totalrightreps;
  l1u.appendChild(l1u3);

  l1.appendChild(l1u);
  orederdList.appendChild(l1);


  newDiv.appendChild(orederdList);

  const currentDiv = document.getElementById(idname);

  currentDiv.appendChild(newDiv);

}


function setImages(modelName){
 
  document.getElementById('img1').src="../models/"+ modelName+"/img1.jpg";
  document.getElementById('img2').src="../models/"+ modelName+"/img2.jpg";
}