# Summer18POC
Summer of 2018 Intern POC Project

Proof-of-concept using Angular 6 and YouTube Data API.

Allows GET, POST, PUT, DELETE requests on videos/data in a single playlist on the corresponding authorized YouTube account.

**Requires ng-gapi package.**<br />
This package should be installed when the repository is cloned and set up locally properly; if not, run `npm install ng-gapi`. See the [documentation](https://github.com/rubenCodeforges/ng-gapi) for more details.

### Setting Up the Project Locally

Navigate to the desired directory location and clone the repository using:
```
git clone https://github.com/LawLogix/Summer18POC.git
```
Then, set up Angular locally. Navigate into the `pocYT` folder and run:
```
npm install
```
For more information on Angular, see the [documentation](https://angular.io/guide/setup).

### Running the Project Locally

Navigate into the `pocYT` folder and run:
```
ng serve --open
```
After compiling, the application should start up in your default browser.

### Testing

This application uses the [Jasmine](https://jasmine.github.io/2.4/introduction.html) test framework. Navigate into the `pocYT` folder and run:
```
ng test
```

### Using the Application

#### Signing In

To sign in, click the sign-in button and sign in to Google using an account that has editing permissions for the playlist(s) you wish to view/edit. To sign out, click the sign-out button.

By default, you may only view playlists and video descriptions. You must sign in with the correct account in order to add videos to, delete videos from, and move videos around in a playlist. If the signed-in account does not have editing permissions for the playlist you wish to edit (i.e. the playlist was not created by current account), you will still be restricted to viewing only.

#### Finding IDs on YouTube

This application deals heavily with YouTube playlist IDs and video IDs.

Playlist ID example: **PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG** from https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG<br />
Video ID example: **dQw4w9WgXcQ** from https://www.youtube.com/watch?v=dQw4w9WgXcQ

To view a specific playlist, copy and paste the desired playlist ID into the corresponding textbox.

To add a video to the current playlist, copy and paste the desired video ID into the corresponding textbox.