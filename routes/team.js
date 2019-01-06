const fs = require('fs');

module.exports = {
  addTeamPage: (req, res) => {
    res.render('add-team.ejs', {
      title: 'Welcome to Socka | Add a new team',
      message: ''
    });
  },
  addTeam: (req, res) => {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    let message = '';
    let team_name = req.body.team_name;
    // let last_name = req.body.last_name;
    // let position = req.body.position;
    // let number = req.body.number;
    // let username = req.body.username;
    let uploadedFile = req.files.image;
    let image_name = uploadedFile.name;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    image_name = team_name + '.team.' + fileExtension;

    let usernameQuery =
      "SELECT * FROM `teams` WHERE team_name = '" + team_name + "'";

    db.query(usernameQuery, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.length > 0) {
        message = 'Team name already exists';
        res.render('add-team.ejs', {
          message,
          title: 'Welcome to Socka | Add a new team'
        });
      } else {
        // check the filetype before uploading it
        if (
          uploadedFile.mimetype === 'image/png' ||
          uploadedFile.mimetype === 'image/jpeg' ||
          uploadedFile.mimetype === 'image/gif'
        ) {
          // upload the file to the /public/assets/img directory
          uploadedFile.mv(`public/assets/img/${image_name}`, err => {
            if (err) {
              return res.status(500).send(err);
            }
            // send the team's details to the database
            let query =
              "INSERT INTO `teams` (team_name, image) VALUES ('" +
              team_name +
              "', '" +
              image_name +
              "')";
            db.query(query, (err, result) => {
              if (err) {
                return res.status(500).send(err);
              }
              res.redirect('/');
            });
          });
        } else {
          message =
            "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
          res.render('add-team.ejs', {
            message,
            title: 'Welcome to Socka | Add a new team'
          });
        }
      }
    });
  },
  editTeamPage: (req, res) => {
    let teamId = req.params.id;
    let query = "SELECT * FROM `teams` WHERE id = '" + teamId + "' ";
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('edit-team.ejs', {
        title: 'Edit  Team',
        team: result[0],
        message: ''
      });
    });
  },
  editTeam: (req, res) => {
    let teamId = req.params.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let position = req.body.position;
    let number = req.body.number;

    let query =
      "UPDATE `teams` SET `first_name` = '" +
      first_name +
      "', `last_name` = '" +
      last_name +
      "', `position` = '" +
      position +
      "', `number` = '" +
      number +
      "' WHERE `teams`.`id` = '" +
      teamId +
      "'";
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect('/');
    });
  },
  deleteTeam: (req, res) => {
    let teamId = req.params.id;
    let getImageQuery = 'SELECT image from `teams` WHERE id = "' + teamId + '"';
    let deleteUserQuery = 'DELETE FROM teams WHERE id = "' + teamId + '"';

    db.query(getImageQuery, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      let image = result[0].image;

      fs.unlink(`public/assets/img/${image}`, err => {
        if (err) {
          return res.status(500).send(err);
        }
        db.query(deleteUserQuery, (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.redirect('/');
        });
      });
    });
  }
};
