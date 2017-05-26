

"use strict"      // Selects strict javascript
var canvas, canvas_size, shaders, gl = null, g_addrs,          // Global variables
	thrust = vec3(), 	origin = vec3( 0, 10, -15 ), looking = false, prev_time = 0, animate = false, animation_time = 0, gouraud = false, color_normals = false;

// *******************************************************

var shader_variable_names = [ "camera_transform", "camera_model_transform", "projection_camera_model_transform", "camera_model_transform_normal",
                              "shapeColor", "lightColor", "lightPosition", "attenuation_factor", "ambient", "diffusivity", "shininess", "smoothness", 
                              "animation_time", "COLOR_NORMALS", "GOURAUD", "USE_TEXTURE" ];
   
function Color( r, g, b, a ) { return vec4( r, g, b, a ); }     // Colors are just special vec4s expressed as: ( red, green, blue, opacity )
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( Color( .8,.3,.8,1 ), .1, 1, 1, 40, undefined ) ); }

// *******************************************************

var texture_filenames_to_load = [ "picnic.png", "text.png", "earth.gif", "photo.png" ];

window.onload = function init() {	var anim = new Animation();	}   // Our whole program's entry point


function Animation()    // A class.  An example of a displayable object that our class GL_Context can manage.
{
	( function init( self )
	{
		self.context = new GL_Context( "gl-canvas", Color( 109/255, 233/255, 167/255, 1 ) );    // Set your background color here
		self.context.register_display_object( self );
		
    shaders = { "Default":     new Shader( "vertex-shader-id", "fragment-shader-id" ), 
                "Demo_Shader": new Shader( "vertex-shader-id", "demo-shader-id"     )  };
    
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
    self.mouse = { "from_center": vec2() };
		            
    self.m_strip       = new Old_Square();                // At the beginning of our program, instantiate all shapes we plan to use, 
		self.m_tip         = new Rounded_Capped_Cylinder( 3, 10 );  //I CHANGED IT, FORGOT THE ORIGINAL              // each with only one instance in the graphics card's memory.
    self.m_cylinder    = new Cylindrical_Tube( 30, 30 );  // For example we'll only create one "cube" blueprint in the GPU, but we'll re-use 
    self.m_smile    = new Smile( 10, 10 );  // For example we'll only create one "cube" blueprint in the GPU, but we'll re-use 

    self.m_torus       = new Torus( 25, 25 );             // it many times per call to display to get multiple cubes in the scene.
    self.m_sphere      = new Sphere( 25, 25 );
    self.poly          = new N_Polygon( 7 );
    self.m_cone        = new Cone( 10, 10 );
    self.m_capped      = new Capped_Cylinder( 4, 12 );
    self.m_capped2      = new Capped_Cylinder( 8, 8 );
    self.m_penta      = new Capped_Cylinder( 4, 12 );

    self.m_capped3      = new Pe( 4, 12 );

    self.m_prism       = new Prism( 8, 8 );
    self.m_cube        = new Cube();
    self.m_obj         = new Shape_From_File( "tri.obj", scale( 1, 1, 1 ) ); //Changed here
    self.m_cloud         = new Shape_From_File( "cloud.obj", scale( .1, .1, .1 ) ); //Changed here

   // self.m_smile         = new Shape_From_File( "haha.obj", scale( .025, .025, .025 ) ); //Changed here

    self.m_sub         = new Subdivision_Sphere( 4, true );
    self.m_axis        = new Axis();
		
// 1st parameter is our starting camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-25), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );
		
		self.context.render();	
	} ) ( this );
	
// *** Mouse controls: ***
  var mouse_position = function( e ) { return vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2 ); };   // Measure mouse steering, for rotating the flyaround camera.     
  canvas.addEventListener("mouseup",   ( function(self) { return function(e)	{ e = e || window.event;		self.mouse.anchor = undefined;              } } ) (this), false );
	canvas.addEventListener("mousedown", ( function(self) { return function(e)	{	e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
  canvas.addEventListener("mousemove", ( function(self) { return function(e)	{ e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );                                         
  canvas.addEventListener("mouseout", ( function(self) { return function(e)	{ self.mouse.from_center = vec2(); }; } ) (this), false );        // Stop steering if the mouse leaves the canvas. 
}
  
// *******************************************************	

//Variables:
var jumping = false; 
var j_height = 0; 

var height = true; 
var gamemode = false;
var obj_dist = 20; 
var obj_jump = 0;
var obj_jump_bool = true; //start off jumping

var rando = 0;
var once = true;

var body; 
var milk; 
//var orange_boo = true;
var red = false; 
var count = 0; 
var train = 0;

Animation.prototype.init_keys = function()
{
	shortcut.add( "x", function() { thrust[1] = -1; } );			shortcut.add( "x", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "Space", function() { jumping = true; } );			shortcut.add( "Space", function() { jumping = true; }, {'type':'keyup'} );
	shortcut.add( "q", function() { gamemode = false; } );			shortcut.add( "q", function() { gamemode = false; }, {'type':'keyup'} );

	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } ); 
	shortcut.add( ",",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
	shortcut.add( ".",   ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform       ); } } ) (this) ) ;
  shortcut.add( "o",   ( function(self) { return function() { origin = vec3( mult_vec( inverse( self.graphicsState.camera_transform ), vec4(0,0,0,1) )                       ); } } ) (this) ) ;
	shortcut.add( "r",   ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud; } );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; }; } ) (this) );	
}

Animation.prototype.update_strings = function( debug_screen_strings )	      // Strings that this displayable object (Animation) contributes to the UI:	
{
	debug_screen_strings.string_map["FPS"]    = "FPS: " + train;
	//debug_screen_strings.string_map["basis"]   = "Showing basis: " + this.m_axis.basis_selection;
	//debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	//debug_screen_strings.string_map["thrust"]  = "Thrust: " + thrust;
	debug_screen_strings.string_map["gamemode"]  = "Game State: " + gamemode;
/*	debug_screen_strings.string_map["j_height"]  = "j_height: " + j_height;
	debug_screen_strings.string_map["obj_dist"]  = "obj_dist: " + obj_dist;
*/


}



function update_camera( self, animation_delta_time )
	{
		var leeway = 70,  degrees_per_frame = .0004 * animation_delta_time,
                      meters_per_frame  =   .01 * animation_delta_time;
										
    if( self.mouse.anchor ) // Dragging mode: Is a mouse drag occurring?
    {
      var dragging_vector = subtract( self.mouse.from_center, self.mouse.anchor);           // Arcball camera: Spin the scene around the world origin on a user-determined axis.
      if( length( dragging_vector ) > 0 )
        self.graphicsState.camera_transform = mult( self.graphicsState.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
            mult( translation(origin),                                                      
            mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ), 
            translation(scale_vec( -1,origin ) ) ) ) );
    }    
          // Flyaround mode:  Determine camera rotation movement first
		var movement_plus  = [ self.mouse.from_center[0] + leeway, self.mouse.from_center[1] + leeway ];  // mouse_from_center[] is mouse position relative to canvas center;
		var movement_minus = [ self.mouse.from_center[0] - leeway, self.mouse.from_center[1] - leeway ];  // leeway is a tolerance from the center before it starts moving.
		
		for( var i = 0; looking && i < 2; i++ )			// Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// A short function for testing.  It draws a lot of things at once.  See display() for a more basic look at how to draw one thing at a time.
Animation.prototype.test_lots_of_shapes = function( model_transform )
  {
    var shapes = [ this.m_prism, this.m_capped, this.m_cone, this.m_sub, this.m_sphere, this.m_obj, this.m_torus ];   // Randomly include some shapes in a list
    var tex_names = [ undefined, "picnic.png", "earth.gif", "photo.png" ]
    
    for( var i = 3; i < shapes.length + 3; i++ )      // Iterate through that list
    {
      var spiral_transform = model_transform, funny_number = this.graphicsState.animation_time/20 + (i*i)*Math.cos( this.graphicsState.animation_time/2000 );
      spiral_transform = mult( spiral_transform, rotation( funny_number, i%3 == 0, i%3 == 1, i%3 == 2 ) );    
      for( var j = 1; j < 4; j++ )                                                                                  // Draw each shape 4 times, in different places
      {
        var mat = new Material( Color( i % j / 5, j % i / 5, i*j/25, 1 ), .3,  1,  1, 40, tex_names[ (i*j) % tex_names.length ] )       // Use a random material
        // The draw call:
        shapes[i-3].draw( this.graphicsState, spiral_transform, mat );			                        //  Draw the current shape in the list, passing in the current matrices		
        spiral_transform = mult( spiral_transform, rotation( 63, 3, 5, 7 ) );                       //  Move a little bit before drawing the next one
        spiral_transform = mult( spiral_transform, translation( 0, 5, 0) );
      } 
      model_transform = mult( model_transform, translation( 0, -3, 0 ) );
    }
    return model_transform;     
  }
    
// *******************************************************	
// display(): Called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{  
		if(!time) time = 0;                                                               // Animate shapes based upon how much measured real time has transpired
		this.animation_delta_time = time - prev_time;                                     // by using animation_time
		if( animate ) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		var model_transform = mat4();	            // Reset this every frame.
		this.basis_id = 0;	                      // For the "axis" shape.  This variable uniquely marks each axis we draw in display() as it counts them up.
    
    shaders[ "Default" ].activate();                         // Keep the flags seen by the default shader program up-to-date
		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud );		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);    
		
    
    this.graphicsState.lights = [];                    // First clear the light list each frame so we can replace & update lights.
    
    var light_orbit = [ Math.cos(this.graphicsState.animation_time/1000), Math.sin(this.graphicsState.animation_time/1000) ];
    this.graphicsState.lights.push( new Light( vec4(  30 * light_orbit[0],  30*light_orbit[1],  34 * light_orbit[0], 1 ), Color( 0, .4, 0, 1 ), 100000 ) );
    this.graphicsState.lights.push( new Light( vec4( -10 * light_orbit[0], -20*light_orbit[1], -14 * light_orbit[0], 0 ), Color( 1, 1, .3, 1 ), 100 * Math.cos(this.graphicsState.animation_time/10000 ) ) );
    
		// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
		var purplePlastic = new Material( Color( 1,1,.9,1 ), 1, 0, 0, 90, "earth.gif" ), // Omit the final (string) parameter if you want no texture
          greyPlastic = new Material( Color( .14,.91,.35,1 ), 1, 0, 0, 20 ), //color depend on time
                g1 = new Material( Color( 1,1,1,1 ), 1, 0, 0, 20 ), //change to 0 later 
                milk_blue = new Material( Color( 72/255,184/255,239/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                pale_yellow = new Material( Color( 255/255,255/255,102/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                black = new Material( Color( 0,0,0,1 ), 1, 0, 0, 20 ), //change to 0 later 
                pale_green = new Material( Color( 152/255,251/255,152/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                med_sea_green = new Material( Color( 60/255,179/255,113/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                pink = new Material( Color( 255/255,192/255,203/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                grey = new Material( Color( 176/255,196/255,222/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                wood = new Material( Color( 255/255,222/255,173/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                slate_grey = new Material( Color( 112/255,128/255,144/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                orange = new Material( Color( 240/255,230/255,140/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                light_grey = new Material( Color( 211/255,211/255,211/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                love_pink = new Material( Color( 255/255,153/255,255/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                bg = new Material( Color( .5,.5,.5,1 ), .6,  0, 0, 40, "photo.png" ),
                purp = new Material( Color( 255/255,229/255,204/255,1 ), 1, 0, 0, 20 ), //change to 0 later 
                red = new Material( Color( 240/255,128/255,128/255,1 ), 1, 0, 0, 20 ), //change to 0 later 

                earth = new Material( Color( .5,.5,.5,1 ), 1,  0, 0, 40, "earth.gif" ),
                white = new Material( Color( 0,0,.24,1 ), 1,  0,  0, 40, "earth.gif" ),                
              picnic = new Material( Color( .5,.5,.5,1 ), 1,  0,  0, 40,"picnic.png" );

			


   model_transform = mult( model_transform, scale( 2, 2, 2 ) ) // this.graphicsState.animation_time/50

  var suns = model_transform;     	// do a game over varble, false if game over

   if( jumping == true ) {
   		gamemode = true; 
   		if (height == true) {
   			j_height += 0.12; 
   		} else {
   			j_height -= 0.12; 
   		}
   		if (j_height > 4) {
   			height = false; 
   		} else if (j_height < 0) {
   			height = true; 
   			jumping = false;
   			count++;  
   			
   		}
   		model_transform = mult( model_transform, translation( 0, j_height,0 ) );


    } 

    train = this.animation_delta_time;
    
	obj_dist = 30 -(time/130) %30; //adjust later


	if (gamemode == true) {
		if (obj_jump_bool == true) {
			obj_jump += 0.075;
		} else {
			obj_jump -= 0.075;
		} 
		if (obj_jump > 1) {
			obj_jump_bool = false; 
		} else if (obj_jump < 0) {
			obj_jump_bool = true;
		}
	}

	Animation.prototype.draw_milk = function (material) {
		model_transform = mult( model_transform, rotation( 45, 0,1,0 ) );
		model_transform = mult( model_transform, scale( 1,1.5,1 ) );

	   	this.m_cube.draw( this.graphicsState, model_transform, material); //body of carton 

		
	    //reset 
	    model_transform = mult( model_transform, translation( .5, .48,.5) );
	    model_transform = mult( model_transform, scale( 0.01950, 0.0175,0.0135 ) );
	    model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );


	    this.m_obj.draw( this.graphicsState, model_transform, g1);
	    model_transform = mult( model_transform, translation( 40, 35,-25.75) );

	    model_transform = mult( model_transform, scale( 125.5, 7.5,52) );

	   	this.m_strip.draw( this.graphicsState, model_transform, material); //body of carton 

		


	    model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );
	    model_transform = mult( model_transform, scale( .05, .25,0.1) );
	    model_transform = mult( model_transform, translation( -15, -30,-3) );


	    for (var a = 0; a < 2; a++) {
	    	model_transform = mult( model_transform, translation( 10, 0, 0) );

	    	this.m_capped.draw( this.graphicsState, model_transform, purplePlastic);

	    }
	    model_transform = mult( model_transform, scale( 3, 3,1) );

	    model_transform = mult( model_transform, translation( -1.8, -1.5,-.25) );
	    model_transform = mult( model_transform, rotation( 180, 0,1,0 ) );

	    this.m_smile.draw( this.graphicsState, model_transform, white);

	    model_transform = mult( model_transform, scale( .075, .075,0) ); 
	    model_transform = mult( model_transform, rotation( 45, 0,0,1 ) );
	    model_transform = mult( model_transform, translation( -17.5, 45,0) );

	    this.m_obj.draw( this.graphicsState, model_transform, g1);

	    model_transform = mult( model_transform, rotation( 180, 0,0,1 ) );
	    model_transform = mult( model_transform, translation( -40, 75,0) );

	    this.m_obj.draw( this.graphicsState, model_transform, g1);
	    model_transform = suns;
	    model_transform = mult( model_transform, rotation( 45, 0,1,0 ) );
	    model_transform = mult( model_transform, translation( -0.55,  j_height ,0) );
	    model_transform = mult( model_transform, scale( .65, .65,.65) ); 


	    this.m_strip.draw( this.graphicsState, model_transform, g1); //nutrion label
	}

	Animation.prototype.draw_cup = function() {
		model_transform = suns;
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    model_transform = mult( model_transform, translation( obj_dist-10 , 0, obj_jump-.75) );
	    model_transform = mult( model_transform, scale( .65, .65,1.5) );

	    body = this.m_cylinder.draw( this.graphicsState, model_transform, pale_green); //cup
	    model_transform = suns;
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    model_transform = mult( model_transform, translation( obj_dist-10, 0, obj_jump-1.57) );
	    model_transform = mult( model_transform, scale( .651, .651,.1) );

	    this.m_cylinder.draw( this.graphicsState, model_transform, med_sea_green);// rim

	   	model_transform = suns; 
	   //	model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    model_transform = mult( model_transform, translation( obj_dist -10.75, 1-obj_jump, .65) );
	    model_transform = mult( model_transform, scale( .05, .05,.05) );
	    for (var a = 0; a < 2; a++) {
	    	model_transform = mult( model_transform, translation( 10, 0, 0) ); //distance between eyes

	    	this.m_capped.draw( this.graphicsState, model_transform, black); //eyes

	    } 
		model_transform = suns; 
		model_transform = mult( model_transform, translation( obj_dist-10, .75-obj_jump, 0.65) );
	    model_transform = mult( model_transform, scale( .15, .15,.15) );

	    this.m_smile.draw( this.graphicsState, model_transform, black); //smile
	}

	Animation.prototype.draw_pencil =  function() {
		model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, obj_jump+1-.38, 0) );
	    model_transform = mult( model_transform, scale( .3, 1.75,.3) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    this.m_capped2.draw( this.graphicsState, model_transform, pale_yellow); //pencil body
	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, obj_jump+1.95-.38, 0) );
	    model_transform = mult( model_transform, scale( .3, .2,.3) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    this.m_capped2.draw( this.graphicsState, model_transform, grey);//eraser container
	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, obj_jump+2.2-.38, 0) );
	    model_transform = mult( model_transform, scale( .3, .35,.3) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    this.m_capped2.draw( this.graphicsState, model_transform, pink);//eraser 
	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, obj_jump-0.18-.38, 0) );
	    model_transform = mult( model_transform, scale( .3, .3,.3) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );
	 
	    this.m_cone.draw( this.graphicsState, model_transform, wood); //pencil tip 
	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, obj_jump-.38-.38, 0) );
	    model_transform = mult( model_transform, scale( .13, .13,.13) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );
	 
	    this.m_cone.draw( this.graphicsState, model_transform, slate_grey); //pencil lead 

	    model_transform = suns; 
		 model_transform = mult( model_transform, translation( obj_dist-10.35, obj_jump+1.25-.38, .3) );
	    model_transform = mult( model_transform, scale( .05, .05,.05) ); 
	    //model_transform = mult( model_transform, rotation( 45, 0,-1,0 ) );

	    for (var a = 0; a < 2; a++) {
	    	model_transform = mult( model_transform, translation( 4.25, 0, 0) ); //distance between eyes

	    	this.m_capped.draw( this.graphicsState, model_transform, black); //eyes

	    }
		model_transform = suns; 
		model_transform = mult( model_transform, translation( obj_dist-10, obj_jump+1-.38, 0.3) );
	    model_transform = mult( model_transform, scale( .1, .1,.1) );
	    model_transform = mult( model_transform, rotation( 30, 0,-1,0 ) );

	    this.m_smile.draw( this.graphicsState, model_transform, black); //smile
	}


	Animation.prototype.draw_bird = function() {
		model_transform = suns; 
   		model_transform = mult( model_transform, translation( obj_dist-10, -.2-.05,0) );
    	model_transform = mult( model_transform, scale( .5, .3,.3) ); 
    		this.m_sphere.draw( this.graphicsState, model_transform, love_pink);
    	
    	
    	model_transform = suns; 
  		model_transform = mult( model_transform, translation( obj_dist -10.2 , .125-.05,0) );
   		model_transform = mult( model_transform, scale( .25, .25,.25) ); 
   			this.m_sphere.draw( this.graphicsState, model_transform, love_pink);
   		
   		model_transform = suns; 
   		model_transform = mult( model_transform, translation( obj_dist-10.5, .125-.05,0) );
   		model_transform = mult( model_transform, scale( .15, .15,.15) ); 
    	model_transform = mult( model_transform, rotation( -90, 0,1,0 ) );

    	this.m_cone.draw( this.graphicsState, model_transform, black); //beak(?)
		//}

       model_transform = suns; 
 	   model_transform = mult( model_transform, translation( obj_dist-10.2, .125-.05,0.25) );
 	   model_transform = mult( model_transform, scale( .05, .05,.01) ); 
  	//  model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );

  	   this.m_capped.draw( this.graphicsState, model_transform, black); //eyes
    
  	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, -0.5-.05,3) ); //controls origin

	    model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );

	    model_transform = mult( model_transform, rotation( 55*Math.sin((time/10)), 1,0,0 ) );

	    model_transform = mult( model_transform, translation( 3, -.1,0) );
	    model_transform = mult( model_transform, scale( .05, .3,.05) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

	    this.m_capped.draw( this.graphicsState, model_transform, black);

	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( obj_dist-10, -.5-.05,3) ); //controls origin 3,-.3,3

	    model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );

	    model_transform = mult( model_transform, rotation( 55*Math.cos((time/100)), 1,0,0 ) );

	    model_transform = mult( model_transform, translation( 3, -.1,0) );
	    model_transform = mult( model_transform, scale( .05, .3,.05) ); 
	    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );
	    model_transform = mult( model_transform, translation( 1.75, 0,0) );

	    this.m_capped.draw( this.graphicsState, model_transform, black);
	}



	if (count % 2 ==0) {
	   		this.draw_milk(red); //body of carton 

	} else {
	    	this.draw_milk(milk_blue); //body of carton 
	}

    //----------

	this.graphicsState.camera_transform = lookAt( vec3(10,j_height+1.5,20), vec3(0,j_height+1.5,0), vec3(0,10,0) ); //!!!!!!!!!!!!

	model_transform = suns; 
	model_transform = mult( model_transform, translation( 1,  -4.45 ,1) );
    model_transform = mult( model_transform, rotation( 90, 0,1,0 ) );
    model_transform = mult( model_transform, scale( 1, 7.5,65) ); 

	this.m_strip.draw( this.graphicsState, model_transform, picnic); //ground 
	model_transform = suns; 
	model_transform = mult( model_transform, translation( 1,  -2 ,0) );
    model_transform = mult( model_transform, rotation( 90, 0,0,1 ) );
    model_transform = mult( model_transform, rotation( 90, 1,0,0 ) );

    model_transform = mult( model_transform, scale( 1, 30,65) ); 

	this.m_strip.draw( this.graphicsState, model_transform, picnic); //ground 

	model_transform = suns; 

	model_transform = mult( model_transform, translation( -50,   -20,-50) );
    //model_transform = mult( model_transform, scale( .03, .03,.025) ); 
    model_transform = mult( model_transform, scale( 150, 150,150) ); 

	this.m_capped3.draw( this.graphicsState, model_transform, purp);  //bg

    //Moving Objects 

    if (gamemode) {
	    model_transform = suns; 
	    model_transform = mult( model_transform, translation( 0, -.5,0 ) );

	    model_transform = mult( model_transform, scale( .5, .5, .5 ) ) // this.graphicsState.animation_time/50
	
		if (j_height <= 0.2 && obj_dist > 8 && obj_dist < 12) { //change this for the height of animals
			gamemode = false;
		}

		if (rando == 0) {
			if (obj_dist < 0.1) {
				rando = 1; 
			}
	    //Cup
	  		//if (j_height < obj_jump-5.57 && j_height > obj_jump-4.5 || j_height + 1 > obj_jump-4.5 && j_height+1 <obj_jump-5.57 ) { // if rim is above milk bottom && 
	  		//if (j_height+1.75 < obj_jump || j_height-1.5 > obj_jump &&j_height <= 0.2 && obj_dist > 9 && obj_dist < 10) {
	  			// fail to jump 					fail to dodge from above
	  		//if (check_if_colliding(milk, body, milk, )){
	  	//		gamemode = false; 
	  	//	}
	  	this.draw_cup();
	    
	} else if (rando == 1) {
	    //=============================================================================
	    //PENCIL
		if (obj_dist < 0.1) {
			rando = 2; 
		}
			this.draw_pencil();
	    
	} else {
	   	if (obj_dist < 0.1) {
				rando = 0; 
			}
		//=============================================================================
		//for (var a = 0; a < 5; a++) {
			//model_transform = mult( model_transform, translation( obj_dist-10,0,0   ) ); //-10 is for the offset
		this.draw_bird();
  		
	}


    } else {
    	//LOSING SCREEN
    	obj_dist = 30;  //change back later
    	rando = 0;
    }
    


	}	