function getInputValue(){
  // Selecting the input element and get its value 
  var inputVal = document.getElementById("myInput").value;
  const url = '/read/'+inputVal;
  fetch(url, {mode:'cors'})
    .then(
      response => response.json()
	).then(
	  json => plot(json) // Handle here
	);

  function plot(data){
  	if(data[0] == "error"){
  		alert("We couldn't find " + data[1] + ". Please try something new.")
  		console.log("here")
  	} else{
  		console.log("not here")
	    var layout = {
	      showlegend: false,
		  margin: {
	        l: 0,
	        r: 0,
		    b: 10,
		    t: 10,
		    pad: 4
		  }
	    }
	  	document.getElementById("myDiv").innerHTML = "";
	    Plotly.newPlot('myDiv', data, layout);
	}
  }
}