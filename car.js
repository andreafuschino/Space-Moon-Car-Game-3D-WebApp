// STATO DELLA MACCHINA
// (DoStep fa evolvere queste variabili nel tempo)
var px,py,pz,facing; // posizione e orientamento
var mozzoA, mozzoP, sterzo; // stato interno
var vx,vy,vz; // velocita' attuale
  
//queste di solito rimangono costanti
var velSterzo, velRitornoSterzo, accMax, attrito,raggioRuotaA, raggioRuotaP, grip,attritoX, attritoY, attritoZ; 

//DoStep: facciamo un passo di fisica (a delta-t costante)
function CarDoStep(){
  //computiamo l'evolversi della macchina
  var vxm, vym, vzm; // velocita' in spazio macchina
 
  //da vel frame mondo a vel frame macchina
  var cosf = Math.cos(facing*Math.PI/180.0);
  var sinf = Math.sin(facing*Math.PI/180.0);
  vxm = +cosf*vx - sinf*vz;
  vym = vy;
  vzm = +sinf*vx + cosf*vz;
  
  //console.log(gamepad);
 
 if(!gamepad){
  // gestione dello sterzo
  if (key[1]) sterzo+=velSterzo;
  if (key[3]) sterzo-=velSterzo;
  
  sterzo*=velRitornoSterzo;	  //ritorno a volante fermo
  
  if (key[0]) vzm-=accMax; 	 //accelerazione in avanti
  if (key[2]) vzm+=accMax;	//accelerazione indietro
 
 }else{
	gp = navigator.getGamepads()[0];
	//console.log(gp.axes[0]);
	if(gp!=null){
		
		//analogico
		sterzo-=gp.axes[0];
		sterzo-=gp.axes[2];
		
		sterzo*=velRitornoSterzo; // ritorno a volante fermo
		
		if(gp.axes[1]==gp_start && gp.axes[5]==gp_start){
			vzm+=0;
		}else{
			if((gp.axes[1]+gp.axes[5]-gp_start)<=1 && (gp.axes[1]+gp.axes[5]-gp_start)>=-1){ 
				vzm+=accMax*gp.axes[1];
				vzm+=accMax*gp.axes[5];
			}
		}
		
		//freccette
		if(gp.buttons[12].value==1)vzm-=accMax;
		if(gp.buttons[14].value==1)vzm+=accMax;
		if(gp.buttons[13].value==1)sterzo-=velSterzo;
		if(gp.buttons[15].value==1)sterzo+=velSterzo;
		
	}
 }
 
  // attriti (semplificando)
  vxm*=attritoX; 
  vym*=attritoY;
  vzm*=attritoZ;

  // l'orientamento della macchina segue quello dello sterzo
  // (a seconda della velocita' sulla z)
  facing = facing - (vzm*grip)*sterzo;

  // rotazione mozzo ruote (a seconda della velocita' sulla z)
  var da ; //delta angolo
  da=(180.0*vzm)/(Math.PI*raggioRuotaA);
  mozzoA+=da;
  da=(180.0*vzm)/(Math.PI*raggioRuotaP);
  mozzoP+=da;
 
  //ritorno a vel coord mondo
  vx = +cosf*vxm + sinf*vzm;
  vy = vym;
  vz = -sinf*vxm + cosf*vzm;
 
 
	
  //posizione = posizione + velocita * delta t (ma e' delta t costante)
  px+=vx;
  py+=vy;
  pz+=vz;
}


function CarInit(){
  // inizializzo lo stato della macchina
  px=py=pz=facing=0; 		// posizione e orientamento
  mozzoA=mozzoP=sterzo=0;   // stato
  vx=vy=vz=0;      			// velocita' attuale
  key=[false,false,false,false];  // inizializzo la struttura di controllo
 
  //velSterzo=3.4;         	// A
  velSterzo=1.0;       		// A
  velRitornoSterzo=0.93; 	// B, sterzo massimo = A*B / (1-B)
 
  accMax = 0.0022;
  //accMax = 0.0055;
 
  // attriti: percentuale di velocita' che viene mantenuta
  // 1 = no attrito
  // <<1 = attrito grande
  attritoZ = 0.991;  	//piccolo attrito sulla Z (nel senso di rotolamento delle ruote)
  attritoX = 0.8;  		//grande attrito sulla X (per non fare slittare la macchina)
  attritoY = 1.0;  		//attrito sulla y nullo

  // Nota: vel max = accMax*attritoZ / (1-attritoZ)

  raggioRuotaA = 0.25;
  raggioRuotaP = 0.30; 

  grip = 0.2; 	//quanto il facing macchina si adegua velocemente allo sterzo
}
  
