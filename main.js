
var canvas = document.getElementById('my_Canvas');
const gl = canvas.getContext('webgl');

var textCanvas = document.getElementById("text");
const ctx = textCanvas.getContext("2d");


const ext = gl.getExtension('WEBGL_depth_texture');
 if (!ext) {
    console.log('need WEBGL_depth_texture');  // eslint-disable-line
 }



//======================= INITIAL PARAMETERS =========================//
var canvas_width=850;
var canvas_height=500;
var aspect = canvas_width/ canvas_height;
var zmin = 1;
var zmax = 100;
var fov = 40;

var THETA=1.60, PHI=0.21;
var D = 10;


var initial_target = [-1.3, -0.5, 40]; //cambia per cambiare punto di vista es. casco, retro etc..
var initial_target_default = [-1.3, -0.5, 40]; 
var target=[]; //updated target current
var up = [0, 1, 0]; 


var mo_matrix, mo_matrix1; //mo_matrix usata per la corrozzeria, mo_matrix1 per le 4 ruote
var mo_matrix_shuttle;

var end=0;
var start=0;
var shuttle_lancio=0;
var offset=0;
var win = false;
var tempo;
var tempoFinale;
var seconds = 0;

var shadows=false;
var bump_mapping=false;
var pilota_automatico=false;
var luce_on=false;

var gamepad=false;
var gp;
var gp_start;
var ctrl=1; 


var proj_matrix;
var view_matrix;
var camera;
var texture_matrix;
var lightProjectionMatrix;

//main light information
var lightPosition = [0, 7.5, 40];
var initial_lightPosition = [0,7.5, 40];

var lightAmbient =  [0.2, 0.2, 0.2];
var lightDiffuse =  [1.0, 1.0, 1.0];
var lightSpecular = [1.0, 1.0, 1.0];


//sia luce che materiali sono vettori -> MACCHINA
var materialAmbientCar = [0.25, 0.20725, 0.20725]; 
var materialDiffuseCar = [1.0, 0.829, 0.829]; 
var materialSpecularCar = [0.2966648, 0.2966648, 0.2966648];
var materialShininessCar = 11.264;  //Esponente di Phong


//sia luce che materiali sono vettori -> CIRCUITO
var materialAmbientCircuit = [0.25, 0.20, 0.20]; 
var materialDiffuseCircuit = [1.0, 0.829, 0.829]; 
var materialSpecularCircuit = [0.0,0.0,0.0];
var materialShininessCircuit = 11.4;  //Esponente di Phong


//luce fari dx e sx
var lightPosition_faro_dx = [-1.2,  -1, 40.5];
var lightPosition_faro_sx = [-1.5, -1, 40.5];
var limit=degToRad(20); //raggio d'azione fari spot

var initial_lightPosition_faro_dx = [-1.2,  -1, 40.5];
var initial_lightPosition_faro_sx = [-1.5, -1, 40.5];

var target_faro_dx=[-1, -2, 30];
var target_faro_sx=[-1.7, -2, 30];

var initial_target_faro_dx = [-1, -2, 30];
var initial_target_faro_sx = [-1.7, -2, 30];

var lightAmbient_fari =  [0.0, 0.0, 0.0];
var lightDiffuse_fari =  [1.0,1.0, 1.0];
var lightSpecular_fari = [0.8, 0.8, 0.8];



/*============================== FLOOR GEOMETRY INFORMATION ==========================*/
//informazioni sul terreno
const W=1000; // size
const L=1000;
const H=-0.7; // altezza
var numVerticesFloor = 6;

var vertices_floor=[
	[-W,H,L],
	[-W,H,-L], 
	[W,H,-L],
	[W,H,L]];

var vertices_floor_array = [];
var normals_floor_array = [];
var tangent_floor_array = [];
var texcoord2D_floor_array = [];

//sia luce che materiali sono vettori -> FLOOR
var materialAmbientFloor = [0.19225, 0.19225, 0.19225]; 
var materialDiffuseFloor = [0.50754, 0.50754, 0.50754]; 
var materialSpecularFloor = [0.0,0.0,0.0];
var materialShininessFloor = 10;  //Esponente di Phong

//cordinate texture floor
uv1=[0,0];
uv2=[70,0];
uv3=[70,70];
uv4=[0,70];

uv_floor=[uv1,uv2,uv3,uv4];


/*============================== LOAD OBJ + FLOOR GEOMETRY DEFINITION ==========================*/
//car obj components
carrozzeriaObj = new objLoader ("resources/obj/carrozzeria.obj", false);
parabrezzaObj = new objLoader ("resources/obj/parabrezza.obj", false);
ruota_dxObj = new objLoader ("resources/obj/ruota_dx.obj", true);
ruota_sxObj = new objLoader ("resources/obj/ruota_sx.obj", true);
coperchio_sup_grandeObj = new objLoader ("resources/obj/coperchio_sup_grande.obj", true);
coperchio_sup_smallObj = new objLoader ("resources/obj/coperchio_sup_small.obj", true);
fari_grandiObj = new objLoader ("resources/obj/fari_grandi.obj", true);
fari_piccoliObj = new objLoader ("resources/obj/fari_piccoli.obj", true);

//track obj components
roadObj = new objLoader ("resources/obj/road.obj", true);
boosterObj = new objLoader ("resources/obj/booster.obj", true);
deboosterObj = new objLoader ("resources/obj/debooster.obj", true);
grigliaObj = new objLoader ("resources/obj/griglia.obj", true);
cartelloneObj = new objLoader ("resources/obj/cartellone.obj", true);
cartellone_strutturaObj = new objLoader ("resources/obj/cartellone_struttura.obj", false);
camera_cartelloObj = new objLoader ("resources/obj/camera_cartello.obj", true);

//shuttle
shuttleObj = new objLoader ("resources/obj/shuttle.obj", true);

//floor
compute_floor_geometry();
for(var i=0; i<numVerticesFloor; i++) normals_floor_array[i] = Array.prototype.slice.call(m4.normalize(normals_floor_array[i])); //normalize the normals
vertices_floor_array=m4.flatten(vertices_floor_array);
normals_floor_array=m4.flatten(normals_floor_array);
texcoord2D_floor_array = m4.flatten(texcoord2D_floor_array);
tangent_floor_array = m4.flatten(tangent_floor_array);


//calcolo centro della macchina per collissioni
var center_carr=[];
initial_center_carr=compute_center(carrozzeriaObj.vertices, carrozzeriaObj.nvert);
initial_center_carr[0]=initial_center_carr[0]-1.3;
initial_center_carr[2]=initial_center_carr[2]+40;

//calcolo dimensioni tracciato per collissioni
var track_dimension=[];
track_dimension=compute_track_width();


/*===================================================== NURBS CURVE ===========================================*/
//Bezier Curve definition
//la curva è stata prima definita in Blender e poi estratti manualmente i controll points dal file generato
var bezierC={
 deg: 13, // grado della curva
 cp: [   -1.275960 , 0.000000, 40.019226,
		 0.419437, 0.000000, 10.864552,
		 0.440632, 0.000000, 0.080433,
		 1.347425, 0.000000, -21.854113,
		 2.223205, 0.000000, -50.617020,
		 0.604158, 0.000000, -80.267113,
		 3.446360, 0.000000, -121.497093,
		 3.734644, 0.000000, -191.883804,
		 4.445250, 0.000000, -266.122986,
		 4.380293, 0.000000, -329.413574,
		 4.380293, 0.000000, -370.413574,
		 2.380293, 0.000000, -400.413574,
		 2.180293, 0.000000, -410.413574,
		 0.113259, 0.000000, -430.818451],
 ab: [0,1],
};

//Bezier Curve CP
var cpxyz=[];
cpxyz=m4.flatten(bezierC.cp);

//Bezier Curve discretization points
var t=[],xyz=[],dxyz=[],ddxyz=[];
var np=600, nD=3;
t=linspace(bezierC.ab[0],bezierC.ab[1],np);

//valutazione punti curva con algoritmo 2
//var v=decast_valder(bezierC, nD, 2, t)
//xyz=m4.flatten(v.D0);
//dxyz=m4.flatten(v.D1);
//ddxyz=m4.flatten(v.D2);

//valutazione punti curva con algoritmo 1 (più efficente dal punto di vista computazionale)
var cc=bezier_valder(bezierC, nD, 2, t)
xyz=m4.flatten(cc.D0);
dxyz=m4.flatten(cc.D1);
ddxyz=m4.flatten(cc.D2);

//init frenet frame e step
var FF=m4.identity;
var step=0;


 /*===================================================== DEFINING THE BUFFERS ===========================================*/
//car buffers
carrozzeriaBuffers = new objBuffersCollection (gl, carrozzeriaObj, false);
parabrezzaBuffers= new objBuffersCollection (gl, parabrezzaObj, false);
ruota_dxBuffers = new objBuffersCollection (gl, ruota_dxObj, true);
ruota_sxBuffers = new objBuffersCollection (gl, ruota_sxObj, true);
coperchio_sup_grandeBuffers = new objBuffersCollection (gl, coperchio_sup_grandeObj, true);
coperchio_sup_smallBuffers = new objBuffersCollection (gl, coperchio_sup_smallObj, true);
fari_grandiBuffers = new objBuffersCollection (gl, fari_grandiObj, true);
fari_piccoliBuffers = new objBuffersCollection (gl, fari_piccoliObj, true);

//track buffers
roadBuffers = new objBuffersCollection (gl, roadObj, true);
boosterBuffers = new objBuffersCollection (gl, boosterObj, true);
deboosterBuffers = new objBuffersCollection (gl, deboosterObj, true);
grigliaBuffers = new objBuffersCollection (gl, grigliaObj, true);
cartelloneBuffers = new objBuffersCollection (gl, cartelloneObj, true);
cartellone_strutturaBuffers = new objBuffersCollection (gl, cartellone_strutturaObj, false);
camera_cartelloBuffers = new objBuffersCollection (gl, camera_cartelloObj, true);

//shuttle buffers
shuttleBuffers = new objBuffersCollection (gl, shuttleObj, true);

//floor buffers
var vertex_buffer_floor = gl.createBuffer (); 
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_floor); 
gl.bufferData(gl.ARRAY_BUFFER, vertices_floor_array, gl.STATIC_DRAW);

var normal_buffer_floor = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, normal_buffer_floor );
gl.bufferData( gl.ARRAY_BUFFER, normals_floor_array, gl.STATIC_DRAW );

var texcoord_buffer_floor = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoord_buffer_floor);
gl.bufferData(gl.ARRAY_BUFFER, texcoord2D_floor_array, gl.STATIC_DRAW);

var tanget_buffer = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, tanget_buffer );
gl.bufferData( gl.ARRAY_BUFFER, tangent_floor_array, gl.STATIC_DRAW );

// bezier curve buffers
var vertex_buffer4 = gl.createBuffer (); 
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer4); 
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(xyz), gl.STATIC_DRAW);

var vertex_buffer5 = gl.createBuffer (); 
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer5); 
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cpxyz), gl.STATIC_DRAW);



/*=========================================== DEFINING AND LOADING TEXTURE =============================================*/
  //struttura dati che contiene le texture e il relativo path
  const textureInfos = [{text: texture_coperchio_grande = gl.createTexture(), url: "resources/texture/coperchio_grande.jpg",},
						{text: texture_coperchio_piccolo = gl.createTexture(), url: "resources/texture/coperchio_piccolo.jpg",},
						{text: texture_fari_grandi = gl.createTexture(), url: "resources/texture/fari_big.jpg",},
						{text: texture_fari_piccoli = gl.createTexture(), url: "resources/texture/fari_small.jpg",},
						{text: texture_ruote = gl.createTexture(), url: "resources/texture/ruote.jpg",},
						{text: texture_track = gl.createTexture(), url: "resources/texture/road.jpg",},
						{text: texture_booster = gl.createTexture(), url: "resources/texture/booster.jpg",},
						{text: texture_debooster = gl.createTexture(), url: "resources/texture/debooster.jpg",},
						{text: texture_griglia = gl.createTexture(), url: "resources/texture/griglia.jpg",},
						{text: texture_cartellone = gl.createTexture(), url: "resources/texture/spacex.jpg",},
						{text: texture_cartello_camera = gl.createTexture(), url: "resources/texture/cartello_camera.jpg",},
						{text: texture_normal = gl.createTexture(), url: "resources/texture/bump_moon.jpg",},
						];
  
  //for each entry della struttura textureInfos
  textureInfos.forEach((textureInfo) => {
    const {text, url} = textureInfo;

	gl.bindTexture(gl.TEXTURE_2D, text);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

	//asynchronously load an image
	var image = new Image();
	image.src = url;
	image.addEventListener('load', function() {
		//now that the image has loaded make copy it to the texture
		gl.bindTexture(gl.TEXTURE_2D, text);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

		//Check if the image is a power of 2 in both dimensions
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		   //se è potenza del 2 allora MIPMAP
		   gl.generateMipmap(gl.TEXTURE_2D);
		} else {
		   //se non è potenza del 2: Turn of mips and set wrapping to clamp to edge
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	  });

  });
  

  
  

/*============================== LOAD IMG 2D CONTEXT ==========================*/
//sfondo pannello di controllo
var image_menu = new Image();
image_menu.src = "resources/others/menu.jpg";
image_menu.addEventListener('load', function() {});

//frecce direzionali su schermo
var directional_keys= new Image(); 
directional_keys.src = "resources/others/directional.png";
directional_keys.addEventListener('load', function() {});

//bottoni
var button1 = new Image(); 
button1.src = "resources/buttons/bottone1.jpg";
button1.addEventListener('load', function() {});
		
var button2 = new Image(); 
button2.src = "resources/buttons/bottone2.jpg";
button2.addEventListener('load', function() {});
	  
var button3 = new Image(); 
button3.src = "resources/buttons/bottone3.jpg";
button3.addEventListener('load', function() {});
	  
var buttonON= new Image(); 
buttonON.src = "resources/buttons/bottoneON.jpg";
buttonON.addEventListener('load', function() {});
		
var buttonOFF= new Image(); 
buttonOFF.src = "resources/buttons/bottoneOFF.jpg";
buttonOFF.addEventListener('load', function() {});

var button_pilota_automatico= new Image(); 
button_pilota_automatico.src = "resources/buttons/pilota_bottone.jpg";
button_pilota_automatico.addEventListener('load', function() {});

var button_pilota_automatico_NO= new Image(); 
button_pilota_automatico_NO.src = "resources/buttons/pilota_bottone_NO.jpg";
button_pilota_automatico_NO.addEventListener('load', function() {});

//bottone fari
var fari_on = new Image(); 
fari_on.src = "resources/buttons/fari_on.jpg";
fari_on.addEventListener('load', function() {});

var fari_off = new Image(); 
fari_off.src = "resources/buttons/fari_off.jpg";
fari_off.addEventListener('load', function() {});

//timer
var timer_img = new Image(); 
timer_img.src = "resources/others/timer.png";
timer_img.addEventListener('load', function() {});

//pip boy
var boy_felice = new Image(); 
boy_felice.src = "resources/others/boy_felice.png";
boy_felice.addEventListener('load', function() {});

var boy_triste = new Image(); 
boy_triste.src = "resources/others/boy_triste.png";
boy_triste.addEventListener('load', function() {});

//retry button
var retry = new Image(); 
retry.src = "resources/buttons/retry.png";
retry.addEventListener('load', function() {});
	
  
 /*=========================================== SHADOWS INFORMATION =============================================*/
//create depth Texture
const depthTexture = gl.createTexture();
const depthTextureSize = 2048;

gl.bindTexture(gl.TEXTURE_2D, depthTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);   
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

//create depthBuffer
const depthFramebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
// attach depthTexture to the depthFramebuffer
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);        


// create a color texture "unusedTexture" of the same size as the depth texture (need for some browser such as Safari)
const unusedTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, depthTextureSize, depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// attach the "unusedTexture" to the depthFramebuffer
gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, unusedTexture, 0); 



/*=========================================== SKYBOX INFORMATION =============================================*/
 var vertex_buffer_skybox = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_skybox );
 var positions = new Float32Array([-1, -1,	1, -1,	-1,  1,	-1,  1,	1, -1,	1,  1,]); //quad
 gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  
 var texture_skybox = gl.createTexture();
 gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture_skybox);

//info texture immagini facce dello skybox
 const faceInfos = [{target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'resources/skybox/pos-x.jpg',},
					{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'resources/skybox/neg-x.jpg',},
					{target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'resources/skybox/pos-y.jpg',},
					{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'resources/skybox/neg-y.jpg',},
					{target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'resources/skybox/pos-z.jpg',},
					{target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'resources/skybox/neg-z.jpg',},
					];
  
  //for each texture in faceInfos
 faceInfos.forEach((faceInfo) => {
   const {target, url} = faceInfo;

   //Upload the canvas to the cubemap face
   const level = 0;
   const internalFormat = gl.RGBA;
   const width = 1024;
   const height = 1024;
   const format = gl.RGBA;
   const type = gl.UNSIGNED_BYTE;

   //setup each face so it's immediately renderable
   gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

   //Asynchronously load an image
   const image = new Image();
   image.src = url;
   image.addEventListener('load', function() {
     //Now that the image has loaded make copy it to the texture
     gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture_skybox);
     gl.texImage2D(target, level, internalFormat, format, type, image);
     gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
   });
 });
  

gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);  


/*=========================  SHADER PROGRAMS BUILD ==========================*/
//SHADERS VERSIONE SENZA OMBRE
//shader di base
var shaderprogram_color = webglUtils.createProgramFromScripts(gl, ['color-vertex-shader', 'color-fragment-shader']); 
//shader per l'enviroment mapping
var shaderprogram_env = webglUtils.createProgramFromScripts(gl, ["vertex-shader-envmap", "fragment-shader-envmap"]);
//shader per lo skybox
var shaderprogram_skybox = webglUtils.createProgramFromScripts(gl, ["vertex-shader-skybox", "fragment-shader-skybox"]);
//shader per l'illuminazione secondo Phong: NO texture
var shaderprogram_phong = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong", "fragment-shader-phong"]);
//shader per l'illuminazione secondo Phong: YES texture
var shaderprogram_phong_text = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-text", "fragment-shader-phong-text"]);
//shader per l'illuminazione secondo Phong + SPOT LIGHTS: YES texture  
var shaderprogram_phong_text_spotlight = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-text-spotlight", "fragment-shader-phong-text-spotlight"]);
//shader per l'illuminazione secondo Phong + BUMP MAPPING
var shaderprogram_phong_normal_mapping = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-normal-mapping", "fragment-shader-phong-normal-mapping"]);
   
//SHADERS VERSIONE CON OMBRE
//shader per l'illuminazione secondo Phong: NO texture + SHADOWS
var shaderprogram_shadow_notext = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-notexture-shadow", "fragment-shader-phong-notexture-shadow"]); 
//shader per l'illuminazione secondo Phong: YES texture + SHADOWS
var shaderprogram_shadow_text = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-texture-shadow", "fragment-shader-phong-texture-shadow"]); 
//shader per l'illuminazione secondo Phong + SPOT LIGHTS: YES texture + SHADOWS  
var shaderprogram_shadow_phong_text_spotlight = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-text-spotlight-shadow", "fragment-shader-phong-text-spotlight-shadow"]); 
//shader per l'illuminazione secondo Phong + BUMP MAPPING + SHADOWS
var shaderprogram_shadow_phong_normal_mapping = webglUtils.createProgramFromScripts(gl, ["vertex-shader-phong-normal-mapping-shadow", "fragment-shader-phong-normal-mapping-shadow"]);


/*======== Associating attributes to vertex shader =====*/
uniform_Color_Collection = new uniformShaderCollection(gl, "shaderprogram_color");
uniform_Skybox_Collection = new uniformShaderCollection(gl, "shaderprogram_skybox");
uniform_Enviroment_Mapping_Collection = new uniformShaderCollection(gl, "shaderprogram_env");

uniform_Phong_Collection = new uniformShaderCollection(gl, "shaderprogram_phong");
uniform_Text_Collection = new uniformShaderCollection(gl, "shaderprogram_phong_text");
uniform_Spotlight_Collection = new uniformShaderCollection(gl, "shaderprogram_phong_text_spotlight");
uniform_NormalMapping_Collection = new uniformShaderCollection(gl, "shaderprogram_phong_normal_mapping");


uniform_ShadowPhong_Collection = new uniformShaderCollection(gl, "shaderprogram_shadow_notext");
uniform_ShadowText_Collection = new uniformShaderCollection(gl, "shaderprogram_shadow_text");
uniform_ShadowSpotlight_Collection = new uniformShaderCollection(gl, "shaderprogram_shadow_phong_text_spotlight");
uniform_ShadowNormalMapping_Collection = new uniformShaderCollection(gl, "shaderprogram_shadow_phong_normal_mapping");

/*============================================ INITIAL EVENTS ============================================*/
//more info on the others events in events.js
window.addEventListener("click", checkButtonClick);
window.addEventListener('keydown', doKeyDown, true);
window.addEventListener('keyup', doKeyUp, true);
window.addEventListener('touchstart', doTouchDown, true);
window.addEventListener('touchend', doTouchUp, true);
window.addEventListener('mousedown', doMouseDown, true);
window.addEventListener('mouseup', doMouseUp, true);


/*============================================  DRAW FUNCTIONS ====================================*/
//draw Carrozzeria auto
function renderCarrozzeria(){
	gl.bindBuffer(gl.ARRAY_BUFFER, carrozzeriaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, carrozzeriaBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
		
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);

	gl.drawArrays(gl.TRIANGLES, 0, carrozzeriaObj.nface*3);
}

//draw CoperchioGrande dell'auto
function renderCoperchioGrande(){
	gl.bindBuffer(gl.ARRAY_BUFFER, coperchio_sup_grandeBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, coperchio_sup_grandeBuffers.normal_buffer );
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, coperchio_sup_grandeBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_coperchio_grande);

	gl.drawArrays(gl.TRIANGLES, 0, coperchio_sup_grandeObj.nface*3);
}

//draw CoperchioPiccolo dell'auto
function renderCoperchioPiccolo(){
	gl.bindBuffer(gl.ARRAY_BUFFER, coperchio_sup_smallBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, coperchio_sup_smallBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, coperchio_sup_smallBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_coperchio_piccolo);

	gl.drawArrays(gl.TRIANGLES, 0, coperchio_sup_smallObj.nface*3);
}

//draw FariGrandi dell'auto
function renderFariGrandi(){
	gl.bindBuffer(gl.ARRAY_BUFFER, fari_grandiBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, fari_grandiBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, fari_grandiBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
				
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_fari_grandi);

	gl.drawArrays(gl.TRIANGLES, 0, fari_grandiObj.nface*3 );
}

//draw FariPiccoli dell'auto
function renderFariPiccoli(){
	gl.bindBuffer(gl.ARRAY_BUFFER, fari_piccoliBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, fari_piccoliBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);

	gl.bindBuffer(gl.ARRAY_BUFFER, fari_piccoliBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
		
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_fari_piccoli);

	gl.drawArrays(gl.TRIANGLES, 0, fari_piccoliObj.nface*3 );
}
	
//draw Parabrezza dell'auto	
function renderParabrezza(){
	gl.bindBuffer(gl.ARRAY_BUFFER, parabrezzaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Enviroment_Mapping_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Enviroment_Mapping_Collection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, parabrezzaBuffers.normal_buffer );
	gl.vertexAttribPointer(uniform_Enviroment_Mapping_Collection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniform_Enviroment_Mapping_Collection._normal);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture_skybox);

	gl.drawArrays(gl.TRIANGLES, 0, parabrezzaObj.nface*3 );
}

//draw Ruote dell'auto	
function renderWheel(pos){
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_ruote);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	if(pos=="dx"){
		gl.bindBuffer(gl.ARRAY_BUFFER, ruota_dxBuffers.vertex_buffer);
		gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
		gl.enableVertexAttribArray(uniformCollection._position);

		gl.bindBuffer( gl.ARRAY_BUFFER, ruota_dxBuffers.normal_buffer );
		gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(uniformCollection._normal);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, ruota_dxBuffers.texcoord_buffer);
		gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(uniformCollection._texcoord);	

		gl.drawArrays(gl.TRIANGLES, 0, ruota_dxObj.nface*3 );		
	}
	if(pos=="sx"){
		gl.bindBuffer(gl.ARRAY_BUFFER, ruota_sxBuffers.vertex_buffer);
		gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
		gl.enableVertexAttribArray(uniformCollection._position);

		gl.bindBuffer( gl.ARRAY_BUFFER, ruota_sxBuffers.normal_buffer);
		gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(uniformCollection._normal);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, ruota_sxBuffers.texcoord_buffer);
		gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(uniformCollection._texcoord);

		gl.drawArrays(gl.TRIANGLES, 0, ruota_sxObj.nface*3 );		
	}
}

//draw Strada 
function renderRoad(){
	gl.bindBuffer(gl.ARRAY_BUFFER, roadBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, roadBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, roadBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
				
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_track);

	gl.drawArrays(gl.TRIANGLES, 0, roadObj.nface*3 );
}

//draw Limitatori di velocità
function renderBooster(){
	gl.bindBuffer(gl.ARRAY_BUFFER, boosterBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, boosterBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, boosterBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
				
	gl.activeTexture(gl.TEXTURE0);				
	gl.bindTexture(gl.TEXTURE_2D, texture_booster);

	gl.drawArrays(gl.TRIANGLES, 0, boosterObj.nface*3 );		
}

//draw Potenziatore di velocità
function renderDebooster(){
	gl.bindBuffer(gl.ARRAY_BUFFER, deboosterBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, deboosterBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, deboosterBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
				
	gl.activeTexture(gl.TEXTURE0);				
	gl.bindTexture(gl.TEXTURE_2D, texture_debooster);

	gl.drawArrays(gl.TRIANGLES, 0, deboosterObj.nface*3 );
}
	
//draw Griglia 
function renderGriglia(){	
	gl.bindBuffer(gl.ARRAY_BUFFER, grigliaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, grigliaBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, grigliaBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
					
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_griglia);

	gl.drawArrays(gl.TRIANGLES, 0, grigliaObj.nface*3 );

}	

//draw Suolo lunare
function renderFloor(){
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_floor);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);
	
	gl.bindBuffer( gl.ARRAY_BUFFER, normal_buffer_floor );
    gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(uniformCollection._normal);
	
	if(program!=shaderprogram_phong && program!=shaderprogram_shadow_notext){
		gl.bindBuffer(gl.ARRAY_BUFFER, tanget_buffer);
		gl.vertexAttribPointer(uniformCollection._tangent, 3, gl.FLOAT, false,0,0); 
		gl.enableVertexAttribArray(uniformCollection._tangent);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, texcoord_buffer_floor);
		gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(uniformCollection._texcoord);
	}
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_normal);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);

	gl.drawArrays(gl.TRIANGLES, 0, numVerticesFloor);
}

//draw Cartellone autore
function renderCartellone(){
	gl.bindBuffer(gl.ARRAY_BUFFER, cartelloneBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, cartelloneBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, cartelloneBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
			
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_cartellone);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);

	gl.drawArrays(gl.TRIANGLES, 0, cartelloneObj.nface*3 );
}

//draw Cartellone pubblicitario
function renderCartelloSpaceInvaders(){	
	gl.bindBuffer(gl.ARRAY_BUFFER, camera_cartelloBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);
		
	gl.bindBuffer( gl.ARRAY_BUFFER, camera_cartelloBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, camera_cartelloBuffers.texcoord_buffer);
	gl.vertexAttribPointer(uniformCollection._texcoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._texcoord);
			
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture_cartello_camera);

	gl.drawArrays(gl.TRIANGLES, 0, camera_cartelloObj.nface*3 );	
}
	
//draw Struttura del Cartello autore
function renderStrutturaCartellone(){		
	gl.bindBuffer(gl.ARRAY_BUFFER, cartellone_strutturaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);

	gl.bindBuffer( gl.ARRAY_BUFFER, cartellone_strutturaBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	
	gl.drawArrays(gl.TRIANGLES, 0, cartellone_strutturaObj.nface*3);
	
}

//draw dello Space Shuttle
function renderShuttle(){
	gl.bindBuffer(gl.ARRAY_BUFFER, shuttleBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniformCollection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniformCollection._position);
	
	gl.bindBuffer( gl.ARRAY_BUFFER, shuttleBuffers.normal_buffer);
	gl.vertexAttribPointer(uniformCollection._normal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(uniformCollection._normal);

	gl.drawArrays(gl.TRIANGLES, 0, shuttleObj.nface*3);
}


//draw dello Skybox cielo stellato
function renderSkybox(){
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_skybox);
	gl.vertexAttribPointer(uniform_Skybox_Collection._position, 2, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Skybox_Collection._position);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture_skybox);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}


//calcolo della shadow map considerando le sole entita attive nel calcolo delle ombre (ex. no suolo lunare)
function compute_shadows(){
	gl.useProgram(shaderprogram_color);  
	
	//punto di vista della luce
	gl.uniformMatrix4fv(uniform_Color_Collection._Pmatrix, false, lightProjectionMatrix); 
	//view_matrix = inversa della camera matrix light
	gl.uniformMatrix4fv(uniform_Color_Collection._Vmatrix, false, m4.inverse(lightWorldMatrix));
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, mo_matrix);
	gl.uniform4fv(uniform_Color_Collection._color,[0,0,1,1]);			
		
	//carrozzeria
	gl.bindBuffer(gl.ARRAY_BUFFER, carrozzeriaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Color_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Color_Collection._position);
	gl.drawArrays(gl.TRIANGLES, 0, carrozzeriaObj.nface*3);

	//parabrezza	
	gl.bindBuffer(gl.ARRAY_BUFFER, parabrezzaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Color_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Color_Collection._position);
	gl.drawArrays(gl.TRIANGLES, 0, parabrezzaObj.nface*3);

	//primo cartellone
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, m4.identity());
	gl.bindBuffer(gl.ARRAY_BUFFER, cartelloneBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Color_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Color_Collection._position);
	gl.drawArrays(gl.TRIANGLES, 0, cartelloneObj.nface*3);

	//ultimo cartellone
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, m4.translate(m4.identity(),3.6,0,-372));
	gl.drawArrays(gl.TRIANGLES, 0, cartelloneObj.nface*3);

	//space invaders
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, m4.translate(m4.identity(),0,0,-60));
	gl.bindBuffer(gl.ARRAY_BUFFER, camera_cartelloBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Color_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Color_Collection._position);
	gl.drawArrays(gl.TRIANGLES, 0, camera_cartelloObj.nface*3 );	
		
	//struttura
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, m4.identity());
	gl.bindBuffer(gl.ARRAY_BUFFER, cartellone_strutturaBuffers.vertex_buffer);
	gl.vertexAttribPointer(uniform_Color_Collection._position, 3, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(uniform_Color_Collection._position);
	gl.drawArrays(gl.TRIANGLES, 0, cartellone_strutturaObj.nface*3);

	//ultima struttura
	gl.uniformMatrix4fv(uniform_Color_Collection._Mmatrix, false, m4.translate(m4.identity(),4,0,-372)); 
	gl.drawArrays(gl.TRIANGLES, 0, cartellone_strutturaObj.nface*3);
	
}

/* //disegna i CP della curva di Bezier
function drawCPBezier(){
	draw_col=[1,0,0,0];
	gl.uniform3fv(gl.getUniformLocation(shaderprogram_color, "u_color"), draw_col);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer5);
	gl.vertexAttribPointer(gl.getAttribLocation(shaderprogram_color, "a_position"), nD, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(gl.getAttribLocation(shaderprogram_color, "a_position"));
	gl.drawArrays(gl.LINE_STRIP, 0, bezierC.deg+1); 
}

//disegna la curva di Bezier
function drawBezier(){
	draw_col=[0,0,0,0];
	gl.uniform3fv(gl.getUniformLocation(shaderprogram_color, "u_color"), draw_col);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer4);
	gl.vertexAttribPointer(gl.getAttribLocation(shaderprogram_color, "a_position"), nD, gl.FLOAT, false,0,0); 
	gl.enableVertexAttribArray(gl.getAttribLocation(shaderprogram_color, "a_position"));
	gl.drawArrays(gl.LINE_STRIP, 0, np); 
} */



/*============================================ RENDER FUNCTION + FPS ====================================*/

var render=function() {
	
    //aggiorno target in base allo spostamento dell macchina
	target[0]=initial_target[0]+px;
	target[1]=initial_target[1]+py;
	target[2]=initial_target[2]+pz;
	//la luce principale segue in avanti e indietro lo spostameno della macchina
	lightPosition[2]=initial_lightPosition[2]+pz;
	//la luce dei fari segue avanti e indietro lo spostameno della macchina
	lightPosition_faro_dx[0]=initial_lightPosition_faro_dx[0]+px;
	lightPosition_faro_dx[2]=initial_lightPosition_faro_dx[2]+pz;
	lightPosition_faro_sx[0]=initial_lightPosition_faro_sx[0]+px;
	lightPosition_faro_sx[2]=initial_lightPosition_faro_sx[2]+pz;
	//aggiorno target luci fari in base allo spostamento dell macchina
	target_faro_dx[0]=initial_target_faro_dx[0]+px;
	target_faro_dx[2]=initial_target_faro_dx[2]+pz;
	target_faro_sx[0]=initial_target_faro_sx[0]+px;
	target_faro_sx[2]=initial_target_faro_sx[2]+pz;
	//aggiorno il centro della macchina per eventuali collissioni
	center_carr[0]=initial_center_carr[0]+px;
	center_carr[1]=initial_center_carr[1]+py;
	center_carr[2]=initial_center_carr[2]+pz;


	if(pilota_automatico){
		FF=frenet_frame(xyz,dxyz,ddxyz,step);
		step += 3;
		if(step>=3*np) step=0;
		
		//console.log(FF);
		FF=m4.flatten(FF); 

		//aggiorno informazioni relativamente allo spostamento della macchina
		target[0]=initial_target[0]-(initial_target_default[0]-FF[12]);
		target[1]=initial_target[1];
		target[2]=initial_target[2]-(initial_target_default[2]-FF[14]);

		lightPosition[2]=initial_lightPosition[2]-(initial_target_default[2]-FF[14]);
		
		center_carr[0]=initial_center_carr[0]-(initial_center_carr[0]-FF[12]);
		center_carr[2]=initial_center_carr[2]-(initial_center_carr[2]-FF[14]);
		
		//last step
		if(center_carr[2]<-430)step=1797;
	}
	
	//console.log(center_carr);

	//check collision
	checkCollision();
	
	
	//update mo_matrix car: nel caso di pilota automatico mo_matrix=FF
	if(pilota_automatico){
		mo_matrix=m4.scale(FF,0.1,0.1,0.1);
		mo_matrix=m4.yRotate(mo_matrix,degToRad(-90));
		mo_matrix=m4.zRotate(mo_matrix,degToRad(-90));
	}
	
	if(!pilota_automatico){
		mo_matrix=m4.translate(m4.identity(),-1.3,0,40);
		mo_matrix=m4.scale(mo_matrix,0.1,0.1,0.1);  
		mo_matrix=m4.translate(mo_matrix,px*10,py*10,pz*10);
		mo_matrix=m4.yRotate(mo_matrix, degToRad(facing));
	}

	
	//=========================== START THE RENDERING =============================//

	//primo rendering dal punto di vista della luce
	//lightWorldMatrix = camera matrix
	//lightProjectionMatrix = projection matrix
    lightWorldMatrix = m4.lookAt(lightPosition, target, up);
	lightProjectionMatrix = m4.perspective(degToRad(70),aspect,zmin,zmax);   
	
    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//nel caso in cui shadow==true calcolare informazioni depth dei pixel
	if(shadows==true)compute_shadows();

    //ora disegno tutta la scena tenendo in considerazione la shadow map calcolato precedentemente
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL); //per lo skybox sennò lo escludo
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	gl.viewport(0.0, 0.0, canvas_width, canvas_height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//matrice usata per cambio di sistema riferimento
    texture_matrix = m4.identity();
	//scale and offset of 0.5 -> space inside frustum from 0 to 1
    texture_matrix = m4.translate(texture_matrix, 0.5, 0.5, 0.5);
    texture_matrix = m4.scale(texture_matrix, 0.5, 0.5, 0.5);
    texture_matrix = m4.multiply(texture_matrix, lightProjectionMatrix);
   
    //use the inverse of this world matrix to make a matrix that will transform other positions to be relative this this world space
    texture_matrix = m4.multiply(texture_matrix, m4.inverse(lightWorldMatrix));

	//set projection matrix
	proj_matrix = m4.perspective(degToRad(fov), aspect, zmin, zmax);
	
	//rispetto alla formulazione classica vista a lezione, due variazioni:
	//spostamento posizione della camera + destra/sinistra in base a orientamento macchina
	camera = [target[0]+D*Math.sin(PHI)*Math.cos(THETA)+D*Math.sin(degToRad(facing)),
              target[1]+D*Math.sin(PHI)*Math.sin(THETA),
              target[2]+D*Math.cos(PHI) ];
	
	//set view matrix
	view_matrix = m4.inverse(m4.lookAt(camera, target, up));
	
	
	//set direction fari dx e sx
	//specifico nella lookAt i target su cui i fari puntano
	mat_dx= m4.lookAt(lightPosition_faro_dx, target_faro_dx, up);
	mat_sx= m4.lookAt(lightPosition_faro_sx, target_faro_sx, up);
	lightDirection_faro_dx = [-mat_dx[8], -mat_dx[9],-mat_dx[10]];
	lightDirection_faro_sx = [-mat_sx[8], -mat_sx[9],-mat_sx[10]];
	
	
	
	//============================== DRAW OBJECTS =================================//

	//draw Skybox
	gl.useProgram(shaderprogram_skybox);

	view_matrix_skybox=m4.copy(view_matrix);
    // We only care about direction so remove the translation
    view_matrix_skybox[12] = 0;
    view_matrix_skybox[13] = 0;
    view_matrix_skybox[14] = 0;
	
    viewDirectionProjectionMatrix = m4.multiply(proj_matrix, view_matrix_skybox);
    viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);
	
	gl.uniformMatrix4fv(uniform_Skybox_Collection._viewDirectionProjectionInverse, false, viewDirectionProjectionInverseMatrix);	
	renderSkybox();
	
	
	//no texture elements
	if(shadows==true){ program=shaderprogram_shadow_notext; uniformCollection=uniform_ShadowPhong_Collection;}
	if(shadows==false){ program=shaderprogram_phong; uniformCollection=uniform_Phong_Collection;}
	gl.useProgram(program);

	gl.uniform3fv(uniformCollection._Ka, materialAmbientCar);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseCar );
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularCar );
	gl.uniform1f(uniformCollection._shiness, materialShininessCar);	
	gl.uniform1f(uniformCollection._bias, -0.007);	
	
	gl.uniform3fv(uniformCollection._ambientColor, lightAmbient);
	gl.uniform3fv(uniformCollection._diffuseColor, lightDiffuse );
	gl.uniform3fv(uniformCollection._specularColor,lightSpecular );	
	gl.uniform3fv(uniformCollection._lightPos, lightPosition );
	gl.uniform3fv(uniformCollection._cameraPos, camera );
    
	gl.uniformMatrix4fv(uniformCollection._Pmatrix, false, proj_matrix); 
	gl.uniformMatrix4fv(uniformCollection._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix);
	gl.uniformMatrix4fv(uniformCollection._TMmatrix, false, texture_matrix);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix)));
	//carrozzeria
	gl.uniform1i(uniformCollection._textureDepth, 0);
	renderCarrozzeria();
	
	//strutture cartelloni
	gl.uniform3fv(uniformCollection._Ka, materialAmbientCircuit);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseCircuit);
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularCircuit );
	gl.uniform1f(uniformCollection._shiness, materialShininessCircuit);	
	//struttura primo cartellone
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.identity());
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.identity())));
	renderStrutturaCartellone();
	//struttura secondo cartellone
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.translate(m4.identity(),4,0,-372));
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.translate(m4.identity(),4,0,-372))));
	renderStrutturaCartellone();
	
	//shuttle
	if(shuttle_lancio==1){
		mo_matrix_shuttle=m4.identity();
		mo_matrix_shuttle=m4.translate(mo_matrix_shuttle,0,offset,0);
		
		gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix_shuttle);
		gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix_shuttle)));
		renderShuttle();
	}
	
	
	//texture elements 
	if(shadows==true) {program=shaderprogram_shadow_text; uniformCollection=uniform_ShadowText_Collection;}
	if(shadows==false) {program=shaderprogram_phong_text; uniformCollection=uniform_Text_Collection;}
	gl.useProgram(program);   
	
	gl.uniform3fv(uniformCollection._Ka, materialAmbientCar);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseCar );
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularCar );
	gl.uniform1f(uniformCollection._shiness, materialShininessCar);
	gl.uniform1f(uniformCollection._bias, -0.007);	
	
	gl.uniform3fv(uniformCollection._ambientColor,  lightAmbient);
	gl.uniform3fv(uniformCollection._diffuseColor,  lightDiffuse );
	gl.uniform3fv(uniformCollection._specularColor, lightSpecular );	
	gl.uniform3fv(uniformCollection._lightPos,  lightPosition );
	gl.uniform3fv(uniformCollection._cameraPos,  camera );
		
	gl.uniformMatrix4fv(uniformCollection._Pmatrix, false, proj_matrix); 
	gl.uniformMatrix4fv(uniformCollection._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix)));
	gl.uniformMatrix4fv(uniformCollection._TMmatrix, false, texture_matrix);
	
	gl.uniform1i(uniformCollection._textureDepth, 1);	
	gl.uniform1i(uniformCollection._texture2D, 0);		

	renderCoperchioGrande();
	renderCoperchioPiccolo();
	renderFariGrandi();
	renderFariPiccoli();
	
	//ruote
	mo_matrix1=m4.copy(mo_matrix);
	mo_matrix1=m4.translate(mo_matrix1,7.857,1.0549,35.179);
	mo_matrix1=m4.zRotate(mo_matrix1, -degToRad(31));
	mo_matrix1=m4.xRotate(mo_matrix1, degToRad(mozzoP/5));
	
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix1);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix1)));
	renderWheel("dx");
	  
	mo_matrix1=m4.copy(mo_matrix);
	mo_matrix1=m4.translate(mo_matrix1,8.0283,1.0549,10.505);
	mo_matrix1=m4.zRotate(mo_matrix1, -degToRad(31));
	mo_matrix1=m4.xRotate(mo_matrix1, degToRad(mozzoP/5));
	
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix1);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix1)));
	renderWheel("dx");
	  	
	mo_matrix1=m4.copy(mo_matrix);
    mo_matrix1=m4.translate(mo_matrix1,-7.857,1.0549,10.449);
	mo_matrix1=m4.zRotate(mo_matrix1, degToRad(30));
	mo_matrix1=m4.xRotate(mo_matrix1, degToRad(mozzoP/5));
	
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix1);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix1)));
	renderWheel("sx");
	  
	mo_matrix1=m4.copy(mo_matrix);
	mo_matrix1=m4.translate(mo_matrix1,-7.857,1.0549,35.178);
	mo_matrix1=m4.zRotate(mo_matrix1, degToRad(30));
	mo_matrix1=m4.xRotate(mo_matrix1, degToRad(mozzoP/5));
	
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, mo_matrix1);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(mo_matrix1)));
	renderWheel("sx");
	
	
	//cartelloni 
	gl.uniform3fv(uniformCollection._Ka, materialAmbientCircuit);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseCircuit);
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularCircuit );
	gl.uniform1f(uniformCollection._shiness, materialShininessCircuit);	
	//primo cartellone
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.identity());
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.identity())));	
	renderCartellone();
	//ultimo cartellone
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.translate(m4.identity(),3.6,0,-372));
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.translate(m4.identity(),3.6,0,-372))));
	renderCartellone();
	//cartellone space invaders
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.translate(m4.identity(),0,0,-60));
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.identity(),0,0,-60)));
	renderCartelloSpaceInvaders();
	
	
	//parabrezza
	//gl.depthFunc(gl.LESS);
	gl.useProgram(shaderprogram_env);
	
	gl.uniformMatrix4fv(uniform_Enviroment_Mapping_Collection._Pmatrix, false, proj_matrix); 
	gl.uniformMatrix4fv(uniform_Enviroment_Mapping_Collection._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(uniform_Enviroment_Mapping_Collection._Mmatrix, false, mo_matrix);
	gl.uniform3fv(uniform_Enviroment_Mapping_Collection._cameraPos,	camera );
	renderParabrezza();
	
	
	//suolo
	if(shadows==true && bump_mapping==true){ program=shaderprogram_shadow_phong_normal_mapping; uniformCollection=uniform_ShadowNormalMapping_Collection;}
	if(shadows==false && bump_mapping==true){ program=shaderprogram_phong_normal_mapping; uniformCollection=uniform_NormalMapping_Collection;}
	if(shadows==false && bump_mapping==false){ program=shaderprogram_phong; uniformCollection=uniform_Phong_Collection;}
    if(shadows==true && bump_mapping==false){ program=shaderprogram_shadow_notext; uniformCollection=uniform_ShadowPhong_Collection;}
	gl.useProgram(program);  
	
	gl.uniform3fv(uniformCollection._Ka, materialAmbientFloor);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseFloor );
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularFloor );
	gl.uniform1f(uniformCollection._shiness, materialShininessFloor);
	gl.uniform1f(uniformCollection._bias, -0.007);
		
	gl.uniform3fv(uniformCollection._ambientColor,  lightAmbient);
	gl.uniform3fv(uniformCollection._diffuseColor,  lightDiffuse );
	gl.uniform3fv(uniformCollection._specularColor, lightSpecular );	
	gl.uniform3fv(uniformCollection._lightPos,      lightPosition );
    gl.uniform3fv(uniformCollection._cameraPos,   camera );
	
	gl.uniformMatrix4fv(uniformCollection._Pmatrix, false, proj_matrix); 
	gl.uniformMatrix4fv(uniformCollection._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.identity());
	gl.uniformMatrix4fv(uniformCollection._TMmatrix, false, texture_matrix);
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.identity())));

	//suolo lunare
	gl.uniform1i(uniformCollection._textureNormal, 0);	
	gl.uniform1i(uniformCollection._textureDepth, 1);	
	renderFloor();
	
	//componenti circuito
	if(shadows==true){ program=shaderprogram_shadow_text; uniformCollection=uniform_ShadowText_Collection;}
	if(shadows==false && luce_on==true){ program=shaderprogram_phong_text_spotlight; uniformCollection=uniform_Spotlight_Collection;}
	if(shadows==false && luce_on==false){ program=shaderprogram_phong_text; uniformCollection=uniform_Text_Collection;}
	if(shadows==true && luce_on==true){ program=shaderprogram_shadow_phong_text_spotlight; uniformCollection=uniform_ShadowSpotlight_Collection;}
	gl.useProgram(program); 
	
	gl.uniform3fv(uniformCollection._Ka, materialAmbientCircuit);
	gl.uniform3fv(uniformCollection._Kd, materialDiffuseCircuit );
	gl.uniform3fv(uniformCollection._Ks,  materialSpecularCircuit ); 
	gl.uniform1f(uniformCollection._shiness, materialShininessCircuit);	
	gl.uniform1f(uniformCollection._bias, -0.007);	
	gl.uniform1f(uniformCollection._limit, Math.cos(limit));
		
	gl.uniform3fv(uniformCollection._ambientColor,  lightAmbient);
	gl.uniform3fv(uniformCollection._diffuseColor,  lightDiffuse );
	gl.uniform3fv(uniformCollection._specularColor, lightSpecular );	
	gl.uniform3fv(uniformCollection._lightPos,      lightPosition );
	gl.uniform3fv(uniformCollection._cameraPos,   camera );
	gl.uniform3fv(uniformCollection._directionFaroDx,   lightDirection_faro_dx );
	gl.uniform3fv(uniformCollection._directionFaroSx,   lightDirection_faro_sx );

	gl.uniform3fv(uniformCollection._ambientColorFari,  lightAmbient_fari);
	gl.uniform3fv(uniformCollection._diffuseColorFari,  lightDiffuse_fari );
	gl.uniform3fv(uniformCollection._specularColorFari, lightSpecular_fari );	
	gl.uniform3fv(uniformCollection._lightPosFaroDx,   lightPosition_faro_dx );
	gl.uniform3fv(uniformCollection._lightPosFaroSx,   lightPosition_faro_sx );
	
	gl.uniformMatrix4fv(uniformCollection._Pmatrix, false, proj_matrix); 
	gl.uniformMatrix4fv(uniformCollection._Vmatrix, false, view_matrix);
	gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.identity());
	gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(view_matrix)));
	gl.uniformMatrix4fv(uniformCollection._TMmatrix, false, texture_matrix);
	
	//track
	gl.uniform1i(uniformCollection._textureDepth, 1);	
	gl.uniform1i(uniformCollection._texture2D, 0);	
	renderRoad();
	
	if(!pilota_automatico){
		//booster
		gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.scale(m4.identity(),45,40,40));
		gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.scale(m4.identity(),45,40,40))));
		renderBooster();
		//debooster
		gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.scale(m4.identity(),45,40,40));
		gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.scale(m4.identity(),45,40,40))));
		renderDebooster();
		//prima griglia
		gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.scale(m4.identity(),45,40,40));
		gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.scale(m4.identity(),45,40,40))));
		renderGriglia();
		//ultima griglia
		gl.uniformMatrix4fv(uniformCollection._Mmatrix, false, m4.scale(m4.translate(m4.identity(),4.15,0,-372),45,40,40));
		gl.uniformMatrix4fv(uniformCollection._NMmatrix, false, m4.transpose(m4.inverse(m4.scale( m4.translate(m4.identity(),4.15,0,-372),45,40,40))));
		renderGriglia();
	}
	
	
	/* 	
	gl.useProgram(shaderprogram_color);
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderprogram_color, "u_projection"), false, proj_matrix); 
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderprogram_color, "u_view"), false, view_matrix);
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderprogram_color, "u_world"), false, m4.identity());
	drawCPBezier();
	drawBezier();
	*/
 
 
	//========================== gestione TIMER e WIN ==============================//
	if(center_carr[2]<22 && start==0 && !pilota_automatico){
		console.log("TIME START");	
		start=1;
		timer=setInterval(incrementSeconds, 100);
	}
	
	if(start==1){
		if(end==0) tempo=seconds
		if(end==1) tempo=tempoFinale
		ctx.drawImage(timer_img, 635, 85);  
		ctx.fillStyle = 'black';
		ctx.fillRect(690, 90, 70, 40);
		ctx.font = '20pt Calibri';
		ctx.fillStyle = 'red'; 
		ctx.fillText(tempo/10+"s", 695, 120);
	}
	
	if(center_carr[2]<-350 && end==0 && !pilota_automatico){
		console.log("STOP");
		end=1;
		start=0;
		console.log("time =", seconds,"s" );
		tempoFinale=seconds
		clearInterval(timer);
		
		if(seconds<=120) win=true;
	}
	
	//se macchina supera il test timer -> start animazione space shuttle
	if(center_carr[2]<-390 && win==true ){
		shuttle_lancio=1;
		offset=offset+0.03;
	}

	if(!pilota_automatico){
		/*conta chilometri*/
		ctx.fillStyle = 'black';
		ctx.fillRect(640, 40, 121, 40);
		ctx.font = '20pt Calibri';
		ctx.fillStyle = 'red'; 
		if(vz<=0)ctx.fillText(parseInt(-vz*1000,10)+" km/h", 652, 70);
		if(vz>0)ctx.fillText(parseInt(vz*1000,10)+" km/h", 652, 70);
		}else{
		ctx.font = '16pt Calibri';
		ctx.fillStyle = 'red'; 
		ctx.fillText("self driving", 652, 70);
	}
	
	if(gamepad==true){
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 50, 230, 30);
		ctx.font = '15pt Calibri';
		ctx.fillStyle = 'white'; 
		ctx.fillText("GAMEPAD CONNECTED", 20, 70);
	}
	
	
	//draw elements on canvas
	ctx.drawImage(directional_keys, 0, 330);
	
	if(end==1 && win==true)ctx.drawImage(boy_felice,650, 150);
	if(end==1 && win==false)ctx.drawImage(boy_triste,650, 150);
	if(end==1 && win==false)ctx.drawImage(retry,260, 45);
	
	if(!luce_on && pilota_automatico==false){ctx.drawImage(fari_on, 610, 420);}
	if(luce_on && pilota_automatico==false){ctx.drawImage(fari_off, 610, 420);}
	
	
	//============================== disegno il PANNELLO CONTROLLO ===============================//
	//sfondo menu
	ctx.drawImage(image_menu, 771.5, 11);
	
	//testo
	ctx.font = '14pt Calibri';
	ctx.fillStyle = 'blue';
	ctx.fillText("Cerca di raggiungere in meno", 780, 110);
	ctx.fillText("di 12 secondi la fine della", 780, 130);
	ctx.fillText("strada per assistere al lancio", 780, 150);
	ctx.fillText("dello space shuttle", 780, 170);
	
	ctx.font = '12pt Calibri';
	ctx.fillStyle = 'blue';
	ctx.fillText("Suggerimento:  le caselle verdi", 780, 195);
	ctx.fillText("ti aiuteranno ad andare piu' veloce", 780, 210);
	ctx.fillText("mentre le rosse ti rallenteranno!", 780, 225);
	
	ctx.font = '10pt Calibri';
	ctx.fillStyle = 'black';
	ctx.fillText("----------------------------------------------------------", 771, 235);
	
	ctx.font = '16pt Calibri';
	ctx.fillStyle = 'red';
	ctx.fillText("	 PANNELLO DI CONTROLLO 		", 770, 260);
	ctx.font = '12pt Calibri';
	ctx.fillStyle = 'black';
	ctx.fillText("Controllo movimento: tasti WASD", 780, 285);
	ctx.fillText("W up, A six, S retro, D dex", 780, 300); 
	ctx.fillText("Z = accensione/spegnimento fari", 780, 320); 
	ctx.fillText("Cambia visuale", 780, 345); 
	ctx.fillText("Bump Mapping", 780, 395); 
	ctx.fillText("Shadows", 780, 420); 
	ctx.fillText("Puoi attivare il pilota automatico", 780, 450); 
	ctx.fillText("per una panoramica della strada", 780, 465); 
	
	//bottoni
	ctx.drawImage(button1, 780, 350);
	ctx.drawImage(button2, 850, 350);
	ctx.drawImage(button3, 920, 350);
	ctx.drawImage(buttonON, 890, 380);
	ctx.drawImage(buttonOFF, 940, 380);
	ctx.drawImage(buttonON, 890, 405);
	ctx.drawImage(buttonOFF, 940, 405);
	
	if(start==0){ctx.drawImage(button_pilota_automatico, 790, 470);}
	else{ctx.drawImage(button_pilota_automatico_NO, 790, 470);}

}




const FRAMES_PER_SECOND = 30;  // Valid values are 60,30,20,15,10...
// set the mim time to render the next frame
const FRAME_MIN_TIME = (1000/60) * (60 / FRAMES_PER_SECOND) - (1000/60) * 0.5;
var lastFrameTime = 0;  // the last frame time

function update(time){
    if(time-lastFrameTime < FRAME_MIN_TIME){ //skip the frame if the call is too early
        CarDoStep();
        window.requestAnimationFrame(update);
        return; // return as there is nothing to do
    }
    lastFrameTime = time; // remember the time of the rendered frame
    // render the frame
    render();
    window.requestAnimationFrame(update); // get next frame
}


/*======================================= INIT =========================================*/
CarInit();
update(); // start animation
window.requestAnimationFrame(update); 