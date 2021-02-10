var resourceContent;

//pathObj = path del file obj
//colorTriple = eventuale colore definito staticamente 
//booleanText = true/false se oggetto con texture o meno
var objLoader = function (pathObj, booleanText) {
	this.vertices = [];
	this.normals = [];
	this.vertices_array = [];
	this.normals_array = [];

    $.ajax({
        url: pathObj,
        async: false,   // asynchronous request? (synchronous requests are discouraged...)
        cache: false,   // with this, you can force the browser to not make cache of the retrieved data
        dataType: "text",  // jQuery will infer this, but you can set explicitly
        success: function( data, textStatus, jqXHR ) {
        resourceContent = data; // can be a global variable too...
        // process the content...
		}
    });
	
    mesh = ReadOBJ(resourceContent,mesh);
    this.nvert=mesh.nvert;
    this.nedge=mesh.nedge;
    this.nface=mesh.nface;
	this.nnormal=mesh.nnormals;
	this.ntexcoord=mesh.ntexcoord;
	
	
	for(var i=0; i< this.nvert; i++) {
		this.vertices[i] = new Array(3);

		this.vertices[i][0]=mesh.vert[i+1].x;
		this.vertices[i][1]=mesh.vert[i+1].y;
		this.vertices[i][2]=mesh.vert[i+1].z;
	}
	
	
	for(var i=0; i<this.nnormal; i++) {
		this.normals[i] = new Array(3);
		
		this.normals[i][0]=mesh.normal[i].x;
		this.normals[i][1]=mesh.normal[i].y;
		this.normals[i][2]=mesh.normal[i].z;
	}
	
		
	for (var i=1; i<=this.nface; i++) this.vertices_array.push(fill_vertices(mesh.face[i].vert[0]-1,mesh.face[i].vert[1]-1,mesh.face[i].vert[2]-1, this.vertices).flat());
	for (var i=1; i<=this.nface; i++) this.normals_array.push(fill_normals(mesh.face[i].normal[0]-1,mesh.face[i].normal[1]-1,mesh.face[i].normal[2]-1, this.normals).flat());
	this.vertices_array=m4.flatten(this.vertices_array);
	this.normals_array=m4.flatten(this.normals_array);
	
	
/* 	if(colorTriple!=[]){
		this.colors = [];
		this.colors_array = [];

		for(var i=0; i<this.nvert; i++) {
			this.colors[i] = new Array(3);
			
			this.colors[i][0]=colorTriple[0];
			this.colors[i][1]=colorTriple[1];
			this.colors[i][2]=colorTriple[2];
		}
		
		for (var i=1; i<=this.nface; i++) this.colors_array.push(fill_colors(mesh.face[i].vert[0]-1,mesh.face[i].vert[1]-1,mesh.face[i].vert[2]-1, this.colors).flat());
		this.colors_array=m4.flatten(this.colors_array);
		
	} */
	
	
	if(booleanText==true){
		this.texcoord2D = [];
		this.texcoord2D_array = [];
		
		for(var i=0; i<this.ntexcoord; i++) {
			this.texcoord2D[i] = new Array(2);
			
			this.texcoord2D[i][0]=mesh.texcoord[i].x;
			this.texcoord2D[i][1]=mesh.texcoord[i].y;
		}
	
		for (var i=1; i<=this.nface; i++) this.texcoord2D_array.push(fill_texture(mesh.face[i].texcoord[0]-1,mesh.face[i].texcoord[1]-1, mesh.face[i].texcoord[2]-1, this.texcoord2D).flat());
		this.texcoord2D_array = m4.flatten(this.texcoord2D_array);
	}
	

};



function fill_vertices(a, b, c, vertices) {
	vert=[];
    vert.push(vertices[a]); 	 
    vert.push(vertices[b]); 
    vert.push(vertices[c]); 

	return vert;
}


/* function fill_colors(a, b, c, color) {
	col=[];
    col.push(color[a]); 
    col.push(color[b]); 
    col.push(color[c]);  
	
	return col;
} */


function fill_normals(a, b, c, normals) {
	norm=[];
    norm.push(normalize(normals[a])); 
    norm.push(normalize(normals[b])); 
    norm.push(normalize(normals[c])); 
	
	return norm;
}


function fill_texture(a, b, c, texture) {
	text=[];
    text.push(texture[a]); 
    text.push(texture[b]);  
	text.push(texture[c]); 
	
	return text;
}

