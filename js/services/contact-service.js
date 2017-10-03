e2gApp.factory('contactService', ['localStorageService',
  function(localStorageService) {

    function addContact(data, callback) {
      var ParseObject = Parse.Object.extend('Contact');
      var parse = new ParseObject();

      parse.save(data, {
        success: function(parse) {
          if (callback) {
            callback(parse);
          }
        },
        error: function(parse, error) {
          console.log('error!');
          console.log(error);
        }
      });
    }

    function saveContact(objectId, key, value, callback) {
      var parseObject = Parse.Object.extend('Contact');
      var query = new Parse.Query(parseObject);
      query.get(objectId, {
        success: function(object) {

          //save status log
          var updatedBy = localStorageService.get('userType');
          saveContactStatusLog(object, key, value, updatedBy);

          if (value || value === 0) {
            object.set(key, value);
          } else {
            object.unset(key);
          }
          object.save(null, {
            success: function() {
              if (callback) {
                callback();
              }
            }
          });
        }
      });
    }

    function saveContactStatusLog(contact, key, value, updatedBy) {
      var parseObject = Parse.Object.extend('ContactStatusLog');
      var parse = new parseObject();

      switch (key) {
        case 'status':
          parse.set('statusOld', contact.get('status'));
          parse.set('statusNew', value);
          break;
        case 'numberOfGuests':
          parse.set('numberOfGuestsOld', contact.get('numberOfGuests'));
          parse.set('numberOfGuestsNew', value);
          break;
        case 'name':
          parse.set('nameOld', contact.get('name'));
          parse.set('nameNew', value);
          break;
        case 'phone':
          parse.set('phoneOld', contact.get('phone'));
          parse.set('phoneNew', value);
          break;
        default:
          return false;
      }

      parse.set('contact', contact);
      parse.set('event', contact.get('event'));
      parse.set('name', contact.get('name'));
      parse.set('phone', contact.get('phone'));
      parse.set('updatedBy', updatedBy);
      parse.save();
    }

    function getContactStatusLogForEvent(event, callback) {
      var Log = Parse.Object.extend('ContactStatusLog');
      var logQuery = new Parse.Query(Log);
      logQuery.limit(1000);
      logQuery.descending('createdAt');
      logQuery.equalTo('event', event);

      logQuery.find({
        success: function(respondObj) {
          var list = [];
          var i = 0;
          for (key in respondObj) {
            list[i] = respondObj[key].toJSON();
            i++;
          }
          if (callback) {
            callback(list);
          }
          ;
        }
      });
    }

    function deleteContact(objectId) {
      var parseObject = Parse.Object.extend('Contact');
      var query = new Parse.Query(parseObject);
      query.get(objectId, {
        success: function(object) {
          object.destroy();
        }
      });
    }

    function deleteContactList(event) {
      var parseObject = Parse.Object.extend('Contact');
      var query = new Parse.Query(parseObject);
      query.limit(1000);
      query.equalTo('event', event);

      query.find({
        success: function(contacts) {
          for (key in contacts) {
            contacts[key].destroy();
          }
        }
      });
    }

    function deleteProperty(objectId, prop) {
      var parseObject = Parse.Object.extend('Contact');
      var query = new Parse.Query(parseObject);
      query.get(objectId, {
        success: function(object) {
          object.unset(prop);
          object.save();
        }
      });
    }

    function getContactList(event, callback) {
      var Contacts = Parse.Object.extend('Contact');
      var contactsQuery = new Parse.Query(Contacts);
      contactsQuery.limit(1000);

      contactsQuery.equalTo('event', event);

      contactsQuery.find({
        success: function(respondObj) {
          var contactList = [];
          var i = 0;
          for (key in respondObj) {
            contactList[i] = respondObj[key].toJSON();
            i++;
          }
          if (callback) {
            callback(contactList);
          }
        }
      });
    }

    function getCallTeamContactList(event, callback) {
      var Contacts = Parse.Object.extend('Contact');
      var contactsQuery = new Parse.Query(Contacts);

      contactsQuery.equalTo('event', event);
      contactsQuery.equalTo('callTeam', true);

      contactsQuery.find({
        success: function(respondObj) {
          var contactList = [];
          var i = 0;
          for (key in respondObj) {
            contactList[i] = respondObj[key].toJSON();
            i++;
          }
          if (callback) {
            callback(contactList);
          }
        }
      });
    }

    return {
      addContact: addContact,
      getList: getContactList,
      getCallTeamContactList: getCallTeamContactList,
      saveContact: saveContact,
      deleteContact: deleteContact,
      deleteContactList: deleteContactList,
      deleteProperty: deleteProperty,
      getContactStatusLogForEvent: getContactStatusLogForEvent
    };
  }]);
