
 let req = indexedDB.open("gallery", 1);
 let db;
 let numberOfMedia = 0;
 let cardContainer = document.querySelector(".gallery-container");

 req.addEventListener("success", function() {
 	db = req.result;
 	console.log(db);
 })

  req.addEventListener("upgradeneeded", function() {
  	db = req.result;
 	db.createObjectStore("media", { keyPath: "mId" });
 	 
 })

   req.addEventListener("Error", function() {
 	console.log("Error")
 })


function saveMedia(media) {

	if(!db) return;

	let data = {
		mId: Date.now(),
		mediaData: media
	}

	let tx = db.transaction("media", "readwrite");
	let mediaObjectStore = tx.objectStore("media");

	mediaObjectStore.add(data);
}

setTimeout(function() {
	viewMedia();
}, 1000)


function viewMedia() {
	if(!db) return;


	let tx = db.transaction("media", "readonly");
	let mediaObjectStore = tx.objectStore("media");
	let req = mediaObjectStore.openCursor();

	req.addEventListener("success", function() {
		let cursor = req.result;

		if(cursor) {

			numberOfMedia++;

			let card = document.createElement("div");
			card.classList.add("gallery-card");
			card.innerHTML = `
			<div class="media-container"></div>


			<div class="card-data">

				<div class="card-info"></div>


				<div class="media-buttons">
					<button class="download"><i class="fa fa-download" aria-hidden="true"></i></button>
					<button class="delete" data-mid = "${cursor.value.mId}"><i class="fa fa-trash-o" aria-hidden="true"></i></button>
				</div>

				<div class="play-btn" data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="fa fa-play" aria-hidden="true"></i></div>
			</div>`;

			cardContainer.append(card);

			let mediaContainer = card.querySelector(".media-container");
			let data = cursor.value.mediaData;
			let typeOfData = typeof data;

			let downloadBtn = card.querySelector(".download");
			let deleteBtn = card.querySelector(".delete");

			deleteBtn.addEventListener("click", function(e) {
				let mId = Number(e.currentTarget.getAttribute("data-mid"));
				e.currentTarget.parentElement.parentElement.parentElement.remove();
				deleteMedia(mId);


				numberOfMedia--;
				if(numberOfMedia == 0) {
					giveAlert();
				}


			})



			if(typeOfData == "string") {

				card.querySelector(".play-btn").innerHTML = "";

				let img = document.createElement("img");
				img.src = data;

				mediaContainer.append(img);


				downloadBtn.addEventListener("click", function() {
					downloadMedia(data, "image")
				});

			}else if(typeOfData == "object"){

				let video = document.createElement("video");

        let url = URL.createObjectURL(data);

        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        mediaContainer.append(video);


        downloadBtn.addEventListener("click", function() {
					downloadMedia(url, "video")
				});




				let playBtn = card.querySelector(".play-btn");
				playBtn.addEventListener("click", function() {
					let videoPlayerModal = document.querySelector(".modal-body > video");
					videoPlayerModal.src = url;
					videoPlayerModal.muted = false;
					let closeBtn = document.querySelector(".btn-close");
					closeBtn.addEventListener("click", function() {
						videoPlayerModal.muted = true;
					})
				})


			}


			card.addEventListener("mouseover", displayOptions);
			card.addEventListener("mouseout", hideOptions);

			cursor.continue();

			
		} else {
			if(numberOfMedia == 0) {
				giveAlert();
			}
		}
	})
}






function downloadMedia(url, type) {

	let a = document.createElement("a");

	a.href = url;

	if(type == "image") {

		a.download = "image.png";

	}else {

		a.download = "video.mp4";
    
	}

	a.click();
  a.remove()
}




function deleteMedia(mId) {
	let tx = db.transaction("media", "readwrite");
	let mediaObjectStore = tx.objectStore("media");

	mediaObjectStore.delete(mId);
}




function displayOptions(e) {

	e.currentTarget.querySelector(".card-data").style.display = "block"
}

function hideOptions(e) {

	e.currentTarget.querySelector(".card-data").style.display = "none"
}


function giveAlert() {
	let alert = document.createElement("h1");
	alert.innerHTML = `<i class="fa fa-frown-o" aria-hidden="true"></i> Gallery is empty!`;
	alert.classList.add("alert");
	cardContainer.append(alert);
}