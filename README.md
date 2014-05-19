# Filippo 3D

A 3D drawing program built with [Processing](http://www.processing.org).

## Keyboard Interface
###VIEWS
 *  <code>(F)</code>ront
 *  <code>(T)</code>op
 *  <code>(L)</code>eft
 *  <code>(R)</code>ight
 *  <code>(B)</code>ottom
 *  bac<code>(K)</code>
 *  SPACEBAR or MOUSE RIGHT BUTTON switches to free rotation mode
 
### MODEL TRANSLATION<br><code>(relative to mouseX and screen X dimension)</code>
 *  <code>(1)</code> While pressed, translates the drawinng in X
 *  <code>(2)</code> While pressed, translates the drawinng in Y
 *  <code>(3)</code> While pressed, translates the drawinng in Z
 
### MODEL SCALATION<br><code>(relative to mouseX and screen X dimension)</code>
 *  <code>(4)</code> While pressed, scales the drawinng in X
 *  <code>(5)</code> While pressed, scales the drawinng in Y
 *  <code>(6)</code> While pressed, scales the drawinng in Z
 
### MODEL ROTATION
 *  <code>(X)</code> increases the rotation angle in X
 *  <code>(x)</code> decreases the rotation angle in X
 *  <code>(Y)</code> increases the rotation angle in Y
 *  <code>(y)</code> decreases the rotation angle in Y
 *  <code>(Z)</code> increases the rotation angle in Z
 *  <code>(z)</code> decreases the rotation angle in Z
 
### EXPORT
 *  <code>(p)</code> exports a PDF of the current view
 *  <code>(P)</code> exports a series of 36 PDFs rotating in Y
 *  <code>(d)</code> exports a DXF of the 3D model
 
###  OTHER
 *  <code>(A)</code>xis turn ON/OFF
 *  <code>(e)</code>rase the selected stroke
 *  <code>(u)</code>ndo
 *  <code>(m)</code> changes current mode, draw or select
 *  <code>(s)</code> Select Everything
 *  <code>(w)</code> unselect everything
 *  <code>(N)</code> new drawing (erases everything and resets view)
 *  <code>(,)</code> reduce stroke size
 *  <code>(.)</code> increase stroke size