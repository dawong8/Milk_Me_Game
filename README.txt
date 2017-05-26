(For best picture, run with Firefox, not Chrome)

My game is a Milk Carton jumping over various items that will hurt it (thus end the game). To start, press Space. Space is also how you jump up. The game will automatically end you fail to jump over an item. 

My hierarchical items were the milk carton, pencil, cup, and bird. I made draw() functions for each of the item. Also, there are for-loops inside the draw() functions, for example to draw the eyes. 

I made my own custom objects. My custom_object called “Pe” is used in a subtle way because I didn’t like how it looked. You can see the implementation in the Custom_Shapes.js file. It was suppose to be the corners of the milk carton, but I thought using a .obj file that I drew from SketchUp looks better. So, I scaled my custom_object “Pe” to be very large, add a color, and use it as the background. Be sure that you rotate it around with your mouse to see its discontinuous edges and look at the implementation to see that it is flat-shaded. 

The incoming objects are moving towards the milk carton in real-time speed, as it is depending on the variable ‘time’ during their translations. 

I drew 2 planes running horizontally and vertically. The planes are both mapped to an image of wood. 

I was very selective in choosing the colors. I each object to be the same color all around no matter where you look at it. 