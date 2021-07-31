let videoPlayer = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let captureBtn = document.querySelector("#capture");
let videoContainer = document.querySelector(".video-container");
let body = document.querySelector("body");
let isRecording = false;
let mediaRecorder;
let chunks = [];
let filter = "";
let autoClicker = document.querySelector(".auto-clicker");
let isTimerOn = false;
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let currZoom = 1;
let gallery = document.querySelector(".gallery");




gallery.addEventListener("click", function() {
	location.assign("gallery.html");
	// console.log(location);
})

zoomIn.addEventListener("click", function() {

	if(isRecording) return;
	console.log("yes")
	if(currZoom + 0.1 > 3) {
		currZoom = 3
	}else {
		currZoom = currZoom + 0.1;
	}
	
	videoPlayer.style.transform = `scale(${currZoom})`;
})

zoomOut.addEventListener("click", function() {

	if(isRecording) return;

	if(currZoom- 0.1 < 1) {
		currZoom = 1
	}else {
		currZoom = currZoom - 0.1;
	}
	videoPlayer.style.transform = `scale(${currZoom})`;
})




autoClicker.addEventListener("click", function() {

	if(isTimerOn) return;
	if(isRecording) return;

	let h1 = document.createElement("h1");
	h1.id = "click-timer";
	videoContainer.append(h1);
	h1.innerText = 10;
	playSound("timer");
	isTimerOn = true;

	let timeleft = 9;
	let downloadTimer = setInterval(function(){
	  if(timeleft <= 0){
	    clearInterval(downloadTimer);
	    isTimerOn = false;
	    h1.remove();
	    captureBtn.click();
	  } else if(timeleft == 5) {
	  	h1.innerText = timeleft;
	  	playSound("timer")
	  } else if(timeleft == 4) {
	  	h1.innerText = timeleft;
	  	playSound("timer")
	  } else if(timeleft == 3) {
	  	h1.innerText = "Ready";
	  	playSound("timer")
	  } else if(timeleft == 2) {
	  	h1.innerText = "Set";
	  	playSound("timer")
	  }else if(timeleft == 1) {
	  	h1.innerText = "Go";
	  	playSound("timer")
	  }else {
	    h1.innerText = timeleft;
	    playSound("timer");
	  }
	  timeleft -= 1;
	}, 1000);
})







//adding filters
let allFilters = document.querySelectorAll(".filter");
for(let i = 0; i < allFilters.length; i++) {
	allFilters[i].addEventListener("click", function(e) {
		let previousFilter = document.querySelector(".filter-div");

		
		if(isRecording) return;

    	if (previousFilter) previousFilter.remove();


    	let color = e.currentTarget.style.backgroundColor;
    	filter = color;

    	let div = document.createElement("div");
    	div.classList.add("filter-div");
    	div.style.backgroundColor = color;
    	videoContainer.append(div);
	})
}



//Image-clicker()
captureBtn.addEventListener("click", function(e) {

	if(isTimerOn) return;
	if(isRecording) return;

	let innerSymbol = captureBtn.querySelector("i");
	innerSymbol.classList.add("capture-animation");
	playSound("camera");
	setTimeout(function(){
		innerSymbol.classList.remove("capture-animation");
	}, 1000)

	let bottomContainer = document.querySelector(".bottom-container");

	let canvas = document.createElement("canvas");
	canvas.id = "result"
	canvas.width = videoPlayer.videoWidth;
	canvas.height = videoPlayer.videoHeight;

	let tool = canvas.getContext("2d");



	//top left to center
  tool.translate(canvas.width / 2, canvas.height / 2);
  //zoom basically stretch kra canvas ko
  tool.scale(currZoom, currZoom);
  //wapi top left pr leaye origin
  tool.translate(-canvas.width / 2, -canvas.height / 2);



	tool.drawImage(videoPlayer, 0, 0);
	if (filter != "") {
    tool.fillStyle = filter;
    tool.fillRect(0, 0, canvas.width, canvas.height);
  }

	

	bottomContainer.append(canvas);

	setTimeout(function() {

		
		gallery.classList.add("gallery-animation");

		setTimeout(function() {
			gallery.classList.remove("gallery-animation");
		}, 1000)

		let url = canvas.toDataURL();

		saveMedia(url);
		
		canvas.remove();

	}, 2000);

});





//video recording
recordBtn.addEventListener("click", function () {

	if(isTimerOn) return;



  let innerIcon = recordBtn.querySelector("i");
  playSound("video");


  if (isRecording) {
    //recording ko stop krna h
    mediaRecorder.stop();
    isRecording = false;
    innerIcon.classList.remove("record-animation");

    gallery.classList.add("gallery-animation");

		setTimeout(function() {
			gallery.classList.remove("gallery-animation");
		}, 1000)

  } else {
    //recording shuru krni hai
    mediaRecorder.start();
    isRecording = true;
    innerIcon.classList.add("record-animation");

    //removing filter from video
    let previousFilter = document.querySelector(".filter-div");
    if (previousFilter) previousFilter.remove();
    filter = "";


    //removing zoom effect
    currZoom = 1;
    videoPlayer.style.transform = `scale(${1})`;


  }
});



//getting video using web API

let audioAndVideoPromise = navigator.mediaDevices.getUserMedia({
	audio: true,
	video: true
});


audioAndVideoPromise
	.then(function(mediaStream) {
		videoPlayer.srcObject = mediaStream;

		mediaRecorder = new MediaRecorder(mediaStream);

		mediaRecorder.addEventListener("dataavailable", function (e) {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
      let blob = new Blob(chunks, { type: "video/mp4" });
      chunks = [];

      saveMedia(blob);

  
    });


	})
	.catch(function() {
		console.log("Permission Denied.")
	})










function playSound(name) {

  var audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}