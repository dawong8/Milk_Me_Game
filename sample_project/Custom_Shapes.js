

function Shape_From_File( filename, points_transform )
	{
		Shape.call(this);

		this.draw = function( graphicsState, model_transform, material ) 	{
		 	if( this.ready ) Shape.prototype.draw.call(this, graphicsState, model_transform, material );		}

		this.filename = filename;     this.points_transform = points_transform;

		this.webGLStart = function(meshes)
			{
				for( var j = 0; j < meshes.mesh.vertices.length/3; j++ )
				{
					this.positions.push( vec3( meshes.mesh.vertices[ 3*j ], meshes.mesh.vertices[ 3*j + 1 ], meshes.mesh.vertices[ 3*j + 2 ] ) );

					this.normals.push( vec3( meshes.mesh.vertexNormals[ 3*j ], meshes.mesh.vertexNormals[ 3*j + 1 ], meshes.mesh.vertexNormals[ 3*j + 2 ] ) );
					this.texture_coords.push( vec2( meshes.mesh.textures[ 2*j ],meshes.mesh.textures[ 2*j + 1 ]  ));
				}
				this.indices  = meshes.mesh.indices;

        for( var i = 0; i < this.positions.length; i++ )                         // Apply points_transform to all points added during this call
        { this.positions[i] = vec3( mult_vec( this.points_transform, vec4( this.positions[ i ], 1 ) ) );
          this.normals[i]  = vec3( mult_vec( transpose( inverse( this.points_transform ) ), vec4( this.normals[ i ], 1 ) ) );     }

				this.init_buffers();
				this.ready = true;
			}                                                 // Begin downloading the mesh, and once it completes return control to our webGLStart function
		OBJ.downloadMeshes( { 'mesh' : filename }, (function(self) { return self.webGLStart.bind(self) }(this) ) );
	}
inherit( Shape_From_File, Shape );

Make_Shape_Subclass( "Blob", Shape );
    Blob.prototype.populate = function()
    {
       this.positions     .push( vec3(0,0,0), vec3(0,.5,0), vec3(.75,0,0) );   
       this.normals       .push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,.25) );   // ...
       this.texture_coords.push( vec2(0,0),   vec2(0,1),   vec2(1,0)   );   // ...
       this.indices       .push( 0, 1, 2 );                                
    };

Make_Shape_Subclass( "Pe", Shape );
    Pe.prototype.populate = function()
    {
    	 var a = 1/Math.sqrt(4);
         this.positions.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0), vec3(0,0,1) );
		 this.positions.push( vec3(0,0,0), vec3(0,1,0), vec3(0,0,1), vec3(1,0,1) );
		 this.positions.push( vec3(0,0,0), vec3(1,0,0), vec3(0,0,1), vec3 (1,0,0) );
		 this.positions.push( vec3(0,0,1), vec3(0,1,0), vec3(1,0,0), vec3 (1, 1, 0) );
		
		 this.normals.push( vec3(0,0,1), vec3(0,0,1), vec3(0,0,1),vec3(0,0,1) ); // Method 2 is flat shaded, since each triangle has its own normal.
		 this.normals.push( vec3(1,0,0), vec3(1,0,0), vec3(1,0,0),vec3(0,0,1) );
		 this.normals.push( vec3(0,1,0), vec3(0,1,0), vec3(0,1,0),vec3(0,0,1) );
		 this.normals.push( vec3(a,a,a), vec3(a,a,a), vec3(a,a,a), vec3(a,a,a) );

		 // Each face in Method 2 also gets its own set of texture coords (half the image is mapped onto each face). We couldn't do
		 // this with shared vertices -- after all, it involves different results when approaching the same point from different directions.
		 this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0),vec3(0,0,1) );
		 this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0),vec3(0,0,1) );
		 this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0),vec3(0,0,1) );
		 this.texture_coords.push( vec3(0,0,0), vec3(0,1,0), vec3(1,0,0),vec3(0,0,1) );

		 this.indices.push( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,12,13,14 );                              
    };

Make_Shape_Subclass( "Smile", Shape );
  Smile.prototype.populate = function( recipient, rows, columns, points_transform = mat4() ) 
        {  Patch.prototype.populate( recipient, rows, columns, -180, [ vec3( 1, 0, .5 ), vec3( 1, 0, -.5 ) ], false, points_transform );     }
