
function incrementSeconds() {seconds += 1;}

function degToRad(d){return d * Math.PI / 180;}

function normalize(v, dst) {
    dst = new Array(3);
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
      dst[0] = v[0] / length;
      dst[1] = v[1] / length;
      dst[2] = v[2] / length;
    }
    return dst;
}

function isPowerOf2(value) {return (value & (value - 1)) === 0;}

 function compute_center(vertices, num_vert){
  var csx,csy,csz;
  xmin = vertices[0][0];
  ymin = vertices[0][1];
  zmin = vertices[0][2];

  xmax_center = xmin;
  ymax_center = ymin;
  zmax_center = zmin;
  
  for (var k=1;k<num_vert;k++) {
        if (vertices[k][0] > xmax_center) xmax_center = vertices[k][0];
                else if (vertices[k][0] <xmin) xmin = vertices[k][0];
        if (vertices[k][1] > ymax_center) ymax_center = vertices[k][1];
                else if (vertices[k][1] < ymin) ymin = vertices[k][1];
        if (vertices[k][2]> zmax_center) zmax_center = vertices[k][2];
                else if (vertices[k][2] < zmin) zmin = vertices[k][2];
  }

  csx = (xmin + xmax_center)/2;
  csy = (ymin + ymax_center)/2;
  csz = (zmin + zmax_center)/2;
  
  return ([csx,csy,csz]);
}


 function compute_track_width(){
 var xmax = -99;
 var xmin = 99;
 
  for (var k=1;k<roadObj.nvert;k++) {
        if (roadObj.vertices[k][0] > xmax) xmax = roadObj.vertices[k][0];
        if (roadObj.vertices[k][0] < xmin) xmin = roadObj.vertices[k][0];
  }

  return([xmax, xmin]);
}


//tre tipi di collisione:
//1- macchina esce fuori dalla pista
//2- macchina passa sui potenziatori
//3- macchina passa sui limitatori
function checkCollision(){
	//check se la macchina esce dalla pista
	if(center_carr[2]<-408)vz=0;
	if(center_carr[2]>109)vz=0;
	
	if(center_carr[0]<track_dimension[1])vz=0;
	if(center_carr[0]>track_dimension[0])vz=0;
	
	//check collisione con i booster
	if((center_carr[0]<2.3 && center_carr[0]>0) && (center_carr[2]>-10 && center_carr[2]<-6)) vz=vz*1.12;
	if((center_carr[0]<0 && center_carr[0]>-2.3) && (center_carr[2]>-35 && center_carr[2]<-31)) vz=vz*1.12;
	if((center_carr[0]<0 && center_carr[0]>-2.3) && (center_carr[2]>-48 && center_carr[2]<-44)) vz=vz*1.12;
	if((center_carr[0]<6 && center_carr[0]>4) && (center_carr[2]>-161 && center_carr[2]<-157)) vz=vz*1.12;
	if((center_carr[0]<3 && center_carr[0]>0.7) && (center_carr[2]>-184 && center_carr[2]<-180)) vz=vz*1.12;
	if((center_carr[0]<5.60 && center_carr[0]>3.18) && (center_carr[2]>-240 && center_carr[2]<-236)) vz=vz*1.12;
	if((center_carr[0]<5.60 && center_carr[0]>3.18) && (center_carr[2]>-251 && center_carr[2]<-247)) vz=vz*1.12;
	if((center_carr[0]<5.60 && center_carr[0]>3.18) && (center_carr[2]>-257 && center_carr[2]<-253)) vz=vz*1.12;
	if((center_carr[0]<7 && center_carr[0]>5) && (center_carr[2]>-290 && center_carr[2]<-286)) vz=vz*1.12;
	if((center_carr[0]<6&& center_carr[0]>3.8) && (center_carr[2]>-310 && center_carr[2]<-306)) vz=vz*1.15;
	if((center_carr[0]<3.6&& center_carr[0]>1.3) && (center_carr[2]>-331 && center_carr[2]<-327)) vz=vz*1.12;
	
	//check collisione con i debooster
	if((center_carr[0]<1.15 && center_carr[0]>-0.8) && (center_carr[2]>-113 && center_carr[2]<-109)) vz=vz*0.9;
	if((center_carr[0]<6 && center_carr[0]>3.6) && (center_carr[2]>-144 && center_carr[2]<-140)) vz=vz*0.9;
	if((center_carr[0]<3.25 && center_carr[0]>0.85) && (center_carr[2]>-170 && center_carr[2]<-166)) vz=vz*0.9;
	if((center_carr[0]<6.66 && center_carr[0]>4.6) && (center_carr[2]>-203 && center_carr[2]<-199)) vz=vz*0.9;
	if((center_carr[0]<2.81 && center_carr[0]>0.93) && (center_carr[2]>-222 && center_carr[2]<-218)) vz=vz*0.9;
	if((center_carr[0]<3.25 && center_carr[0]>1) && (center_carr[2]>-277 && center_carr[2]<-281)) vz=vz*0.9;
	if((center_carr[0]<7 && center_carr[0]>5) && (center_carr[2]>-300 && center_carr[2]<-296)) vz=vz*0.9;
	
}


//per ogni faccia del piano suolo
function compute_floor_geometry(){quad( 1, 0, 3, 2 );}

//divido faccia cubo in triangoli con informazioni sui vertici, normali, tangenti, uv coordinates
function quad(a, b, c, d) {
	//calcoliamo info normali
    var t1 = m4.subtractVectors(vertices_floor[b], vertices_floor[a]);
    var t2 = m4.subtractVectors(vertices_floor[c], vertices_floor[b]);
    var normal=[];
    normal = normalize(m4.cross(t1, t2, normal));
	
	//Il calcolo dei vettori tangenti non è così semplice come il vettore normale
	//Sostanzialmente possiamo osservare che la direzione del vettore tangente si allinea con la direzione in cui definiamo le coordinate della texture di una superficie
	//possiamo calcolare tangenti e bitangenti dai vertici di un triangolo e le sue coordinate texture (poiché le coordinate uv sono nello stesso spazio dei vettori tangenti) 
	
	tangent1 =  new Array();
	tangent2 =  new Array();
	
	deltaUV1 = new Array();
	deltaUV2 = new Array();
	
	edge1=new Array();
	edge2=new Array();

	
	//triangle 1
	edge1[0]=vertices_floor[b][0]-vertices_floor[c][0];
	edge1[1]=vertices_floor[b][1]-vertices_floor[c][1];
	edge1[2]=vertices_floor[b][2]-vertices_floor[c][2];
	edge2[0]=vertices_floor[a][0]-vertices_floor[c][0];
	edge2[1]=vertices_floor[a][1]-vertices_floor[c][1];
	edge2[2]=vertices_floor[a][2]-vertices_floor[c][2];
	
	deltaUV1[0]= uv2[0]-uv1[0];
    deltaUV1[1]= uv2[1]-uv1[1];
	deltaUV2[0]= uv3[0]-uv1[0];
	deltaUV2[1]= uv3[1]-uv1[1];
	
	f = 1.0 / (deltaUV1[0] * deltaUV2[1]- deltaUV2[0]* deltaUV1[1]);
	
	//calcoliamo informazione tangente per i vertici primo triangolo
    tangent1[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
    tangent1[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
    tangent1[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);
	tangent1=normalize(tangent1);
	
    vertices_floor_array.push(vertices_floor[a],vertices_floor[b],vertices_floor[c]);
	texcoord2D_floor_array.push(uv_floor[a],uv_floor[b],uv_floor[c])
    normals_floor_array.push(normal,normal,normal); 
	tangent_floor_array.push(tangent1,tangent1,tangent1);

	//triangle 2
	edge1[0]=vertices_floor[a][0]-vertices_floor[c][0];
	edge1[1]=vertices_floor[a][1]-vertices_floor[c][1];
	edge1[2]=vertices_floor[a][2]-vertices_floor[c][2];
	edge2[0]=vertices_floor[d][0]-vertices_floor[c][0];
	edge2[1]=vertices_floor[d][1]-vertices_floor[c][1];
	edge2[2]=vertices_floor[d][2]-vertices_floor[c][2];
	
	deltaUV1[0]= uv3[0]-uv1[0];
    deltaUV1[1]= uv3[1]-uv1[1];
	deltaUV2[0]= uv4[0]-uv1[0];
	deltaUV2[1]= uv4[1]-uv1[1];
	
	f = 1.0 / (deltaUV1[0] * deltaUV2[1]- deltaUV2[0]* deltaUV1[1]);

	//calcoliamo informazione tangente per i vertici secondo triangolo
    tangent2[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
    tangent2[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
    tangent2[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);
	tangent2=normalize(tangent2);
	
    vertices_floor_array.push(vertices_floor[a],vertices_floor[c],vertices_floor[d]);
	texcoord2D_floor_array.push(uv_floor[a],uv_floor[c],uv_floor[d])
    normals_floor_array.push(normal,normal,normal); 
	tangent_floor_array.push(tangent2,tangent2,tangent2); 
}



//objBuffersCollection: oggetto che contiene una collezzione di buffer necessari per gli Obj caricati
//gl = context webgl
//obj = oggetto objLoader
//boolenColor = true/false se mantenere buffer per colore
//booleanText = true/false se mantenere buffer per info texture
var objBuffersCollection = function (gl, obj, booleanText) {
	this.vertex_buffer = gl.createBuffer();
	this.normal_buffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer); 
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices_array, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer); 
	gl.bufferData(gl.ARRAY_BUFFER, obj.normals_array, gl.STATIC_DRAW);

	/* if(boolenColor){
		this.color_buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer); 
		gl.bufferData(gl.ARRAY_BUFFER, obj.colors_array, gl.STATIC_DRAW);
	}
	 */
	 
	if(booleanText){
		this.texcoord_buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoord_buffer); 
		gl.bufferData(gl.ARRAY_BUFFER, obj.texcoord2D_array, gl.STATIC_DRAW);
	}
};


//uniform collection for each shaderprogram
var uniformShaderCollection = function (gl, shaderprogram) {
  switch(shaderprogram) {
	//shader di base = 7 
	case "shaderprogram_color":
		this._position=gl.getAttribLocation(shaderprogram_color, "a_position");
		this._color=gl.getUniformLocation(shaderprogram_color, "u_color" );
		this._Pmatrix=gl.getUniformLocation(shaderprogram_color, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_color, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_color, "u_world");
		break;
	case "shaderprogram_phong":
		this._position=gl.getAttribLocation(shaderprogram_phong, "position");
		this._normal=gl.getAttribLocation(shaderprogram_phong, "normal");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_phong, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_phong, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_phong, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_phong, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_phong, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_phong, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_phong, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_phong, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_phong, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_phong, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_phong, "specularColor");
		this._lightPos=gl.getUniformLocation(shaderprogram_phong, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_phong, "viewPos");
		break;
	case "shaderprogram_phong_text":
		this._position=gl.getAttribLocation(shaderprogram_phong_text, "position");
		this._normal=gl.getAttribLocation(shaderprogram_phong_text, "normal");
		this._texcoord=gl.getAttribLocation(shaderprogram_phong_text, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_phong_text, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_phong_text, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_phong_text, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_phong_text, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_phong_text, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_phong_text, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_phong_text, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_phong_text, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_phong_text, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_phong_text, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_phong_text, "specularColor");
		this._lightPos=gl.getUniformLocation(shaderprogram_phong_text, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_phong_text, "viewPos");
		this._texture2D=gl.getUniformLocation(shaderprogram_phong_text, "u_texture");
		break;
	case "shaderprogram_phong_text_spotlight":
		this._position=gl.getAttribLocation(shaderprogram_phong_text_spotlight, "position");
		this._normal=gl.getAttribLocation(shaderprogram_phong_text_spotlight, "normal");
		this._texcoord=gl.getAttribLocation(shaderprogram_phong_text_spotlight, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "specularColor");
		this._ambientColorFari=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "ambientColor_fari");
		this._diffuseColorFari=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "diffuseColor_fari");
		this._specularColorFari=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "specularColor_fari");
		this._lightPos=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "viewPos");
		this._lightPosFaroDx=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "lightPos_faro_dx");
		this._lightPosFaroSx=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "lightPos_faro_sx");
		this._directionFaroDx=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_lightDirectionDx");
		this._directionFaroSx=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_lightDirectionSx");
		this._limit=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_limit");
		this._texture2D=gl.getUniformLocation(shaderprogram_phong_text_spotlight, "u_texture");
		break;
	case "shaderprogram_phong_normal_mapping":
		this._position=gl.getAttribLocation(shaderprogram_phong_normal_mapping, "position");
		this._normal=gl.getAttribLocation(shaderprogram_phong_normal_mapping, "normal");
		this._tangent=gl.getAttribLocation(shaderprogram_phong_normal_mapping, "tangent");
		this._texcoord=gl.getAttribLocation(shaderprogram_phong_normal_mapping, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "normalMat");
		this._lightPos=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "viewPos");
		this._Ka=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "specularColor");
		this._textureNormal=gl.getUniformLocation(shaderprogram_phong_normal_mapping, "normalMap");
		break;
	case "shaderprogram_skybox":
		this._position=gl.getAttribLocation(shaderprogram_skybox, "a_position");
		this._textureCube=gl.getUniformLocation(shaderprogram_skybox, "u_skybox");
		this._viewDirectionProjectionInverse=gl.getUniformLocation(shaderprogram_skybox, "u_viewDirectionProjectionInverse");
		break;	
	case "shaderprogram_env":
		this._position=gl.getAttribLocation(shaderprogram_env, "a_position");
		this._normal=gl.getAttribLocation(shaderprogram_env, "a_normal");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_env, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_env, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_env, "u_world");
		this._textureCube=gl.getUniformLocation(shaderprogram_env, "u_texture");
		this._cameraPos=gl.getUniformLocation(shaderprogram_env, "u_worldCameraPosition");
		break;
	//shader con shadows = 4
	case "shaderprogram_shadow_notext":
		this._position=gl.getAttribLocation(shaderprogram_shadow_notext, "position");
		this._normal=gl.getAttribLocation(shaderprogram_shadow_notext, "normal");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_shadow_notext, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_shadow_notext, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_shadow_notext, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_shadow_notext, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_shadow_notext, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_shadow_notext, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_shadow_notext, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_shadow_notext, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_shadow_notext, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_shadow_notext, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_shadow_notext, "specularColor");
		this._lightPos=gl.getUniformLocation(shaderprogram_shadow_notext, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_shadow_notext, "viewPos");
		this._TMmatrix=gl.getUniformLocation(shaderprogram_shadow_notext, "u_textureMatrix");
		this._bias=gl.getUniformLocation(shaderprogram_shadow_notext, "u_bias");
		this._textureDepth=gl.getUniformLocation(shaderprogram_shadow_notext, "u_projectedTexture");
		break;
	case "shaderprogram_shadow_text":
		this._position=gl.getAttribLocation(shaderprogram_shadow_text, "position");
		this._normal=gl.getAttribLocation(shaderprogram_shadow_text, "normal");
		this._texcoord=gl.getAttribLocation(shaderprogram_shadow_text, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_shadow_text, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_shadow_text, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_shadow_text, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_shadow_text, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_shadow_text, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_shadow_text, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_shadow_text, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_shadow_text, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_shadow_text, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_shadow_text, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_shadow_text, "specularColor");
		this._lightPos=gl.getUniformLocation(shaderprogram_shadow_text, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_shadow_text, "viewPos");
		this._texture2D=gl.getUniformLocation(shaderprogram_shadow_text, "u_texture");
		this._TMmatrix=gl.getUniformLocation(shaderprogram_shadow_text, "u_textureMatrix");
		this._bias=gl.getUniformLocation(shaderprogram_shadow_text, "u_bias");
		this._textureDepth=gl.getUniformLocation(shaderprogram_shadow_text, "u_projectedTexture");
		break;
	case "shaderprogram_shadow_phong_text_spotlight":
		this._position=gl.getAttribLocation(shaderprogram_shadow_phong_text_spotlight, "position");
		this._normal=gl.getAttribLocation(shaderprogram_shadow_phong_text_spotlight, "normal");
		this._texcoord=gl.getAttribLocation(shaderprogram_shadow_phong_text_spotlight, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "normalMat");
		this._Ka=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "specularColor");
		this._ambientColorFari=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "ambientColor_fari");
		this._diffuseColorFari=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "diffuseColor_fari");
		this._specularColorFari=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "specularColor_fari");
		this._lightPos=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "viewPos");
		this._lightPosFaroDx=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "lightPos_faro_dx");
		this._lightPosFaroSx=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "lightPos_faro_sx");
		this._directionFaroDx=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_lightDirectionDx");
		this._directionFaroSx=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_lightDirectionSx");
		this._limit=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_limit");
		this._texture2D=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_texture");
		this._TMmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_textureMatrix");
		this._bias=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_bias");
		this._textureDepth=gl.getUniformLocation(shaderprogram_shadow_phong_text_spotlight, "u_projectedTexture");
		break;
	case "shaderprogram_shadow_phong_normal_mapping":
		this._position=gl.getAttribLocation(shaderprogram_shadow_phong_normal_mapping, "position");
		this._normal=gl.getAttribLocation(shaderprogram_shadow_phong_normal_mapping, "normal");
		this._tangent=gl.getAttribLocation(shaderprogram_shadow_phong_normal_mapping, "tangent");
		this._texcoord=gl.getAttribLocation(shaderprogram_shadow_phong_normal_mapping, "a_texcoord");
		this._Pmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_projection");
		this._Vmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_view");
		this._Mmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_world");
		this._NMmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "normalMat");
		this._lightPos=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "lightPos");
		this._cameraPos=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "viewPos");
		this._Ka=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "Ka");
		this._Kd=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "Kd");
		this._Ks=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "Ks");
		this._shiness=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "shinessVal");
		this._ambientColor=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "ambientColor");
		this._diffuseColor=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "diffuseColor");
		this._specularColor=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "specularColor");
		this._textureNormal=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "normalMap");
		this._TMmatrix=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_textureMatrix");
		this._bias=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_bias");
		this._textureDepth=gl.getUniformLocation(shaderprogram_shadow_phong_normal_mapping, "u_projectedTexture");
		break;
	default:
		console.log("ERROR get uniform shader");
	}
};

