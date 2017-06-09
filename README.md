<img align="right" style="margin-top:10px;" alt="Office League" src="https://raw.githubusercontent.com/enonic/app-office-league/master/src/main/resources/assets/img/office-league-logo.svg" width="200">

# Office League App

[![Build Status](https://travis-ci.org/enonic/app-office-league.svg?branch=master)](https://travis-ci.org/enonic/app-office-league)
[![License](https://img.shields.io/github/license/enonic/lib-sql.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

Office League application for [Enonic XP](https://enonic.com/developer-tour).

Take foosball to the next level!

- Create your league, invite and play to rule your opponents.
- Record your games while you play
- Interactive live game feed
- Player and team ranking for each league


## Compatibility

| Version | XP Version  | Download                       |
|---------|-------------|----------------------------------|
| 0.2.0   | 6.10.x      | [Download](http://repo.enonic.com/public/com/enonic/app/officeleague/0.2.0/officeleague-0.2.0.jar) |

## Configuration

The application can be configured using the file "com.enonic.app.officeleague.cfg":

| Property name        | Default value                                        | Description                                                               |
|----------------------|------------------------------------------------------|---------------------------------------------------------------------------|
| skip-test-data       | false                                                | Skip the import of test players, teams and league on application start-up |
| officeleague.baseUrl | http://localhost:8080/portal/draft/office-league/app | Application URL used by mail generation                                   |
| mail.from            |                                                      | Skip the import of test players, teams and league on application start-up |
  
```properties
# Example
skip-test-data = true
officeleague.baseUrl = https://officeleague.rocks/app
mail.from = contact@officeleague.rocks
```

