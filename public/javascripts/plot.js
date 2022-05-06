function getInputValue(){
  // Selecting the input element and get its value 
  var nodeName = document.getElementById("nodeInput").value.toLowerCase()
  var weight = document.getElementById("weightInput").value.toLowerCase()
  console.log('node name is '+nodeName)
  console.log('weight is '+weight)
  const url = '/read/'+nodeName+'/weight/'+weight;
  fetch(url, {mode:'cors'})
    .then(
      response => response.json()
	).then(
	  json => plot(json) // Handle here
	);

  function plot(data){
  	if(data[0] == "error"){
  		alert("Your request for the "+data[1]+" knowledge graph returned no results from the database. Try decreasing the edge weight or trying something new.")
  	} else{
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