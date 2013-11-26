// Generated by CoffeeScript 1.6.1
(function() {
  var User,
    _this = this;

  User = (function() {

    function User(rid, apiKey, sid, token) {
      var self,
        _this = this;
      this.rid = rid;
      this.apiKey = apiKey;
      this.sid = sid;
      this.token = token;
      this.writeChatData = function(val) {
        return User.prototype.writeChatData.apply(_this, arguments);
      };
      this.subscribeStreams = function(streams) {
        return User.prototype.subscribeStreams.apply(_this, arguments);
      };
      this.removeStream = function(cid) {
        return User.prototype.removeStream.apply(_this, arguments);
      };
      this.applyClassFilter = function(prop, selector) {
        return User.prototype.applyClassFilter.apply(_this, arguments);
      };
      this.errorSignal = function(error) {
        return User.prototype.errorSignal.apply(_this, arguments);
      };
      this.inputKeypress = function(e) {
        return User.prototype.inputKeypress.apply(_this, arguments);
      };
      this.signalNameHandler = function(event) {
        return User.prototype.signalNameHandler.apply(_this, arguments);
      };
      this.signalFilterHandler = function(event) {
        return User.prototype.signalFilterHandler.apply(_this, arguments);
      };
      this.signalChatHandler = function(event) {
        return User.prototype.signalChatHandler.apply(_this, arguments);
      };
      this.signalInitializeHandler = function(event) {
        return User.prototype.signalInitializeHandler.apply(_this, arguments);
      };
      this.connectionDestroyedHandler = function(event) {
        return User.prototype.connectionDestroyedHandler.apply(_this, arguments);
      };
      this.connectionCreatedHandler = function(event) {
        return User.prototype.connectionCreatedHandler.apply(_this, arguments);
      };
      this.streamDestroyedHandler = function(event) {
        return User.prototype.streamDestroyedHandler.apply(_this, arguments);
      };
      this.streamCreatedHandler = function(event) {
        return User.prototype.streamCreatedHandler.apply(_this, arguments);
      };
      this.sessionDisconnectedHandler = function(event) {
        return User.prototype.sessionDisconnectedHandler.apply(_this, arguments);
      };
      this.sessionConnectedHandler = function(event) {
        return User.prototype.sessionConnectedHandler.apply(_this, arguments);
      };
      this.messageTemplate = Handlebars.compile($("#messageTemplate").html());
      this.userStreamTemplate = Handlebars.compile($("#userStreamTemplate").html());
      this.notifyTemplate = Handlebars.compile($("#notifyTemplate").html());
      this.initialized = false;
      this.chatData = [];
      this.filterData = {};
      this.allUsers = {};
      this.printCommands();
      this.layout = TB.initLayoutContainer(document.getElementById("streams_container"), {
        animate: {
          duration: 500,
          easing: "swing",
          bigFixedRatio: false
        }
      }).layout;
      this.publisher = TB.initPublisher(this.apiKey, "myPublisher", {
        width: "100%",
        height: "100%"
      });
      this.session = TB.initSession(this.sid);
      this.session.on("sessionConnected", this.sessionConnectedHandler);
      this.session.on("sessionDisconnected", this.sessionDisconnectedHandler);
      this.session.on("streamCreated", this.streamCreatedHandler);
      this.session.on("streamDestroyed", this.streamDestroyedHandler);
      this.session.on("connectionCreated", this.connectionCreatedHandler);
      this.session.on("connectionDestroyed", this.connectionDestroyedHandler);
      this.session.on("signal:initialize", this.signalInitializeHandler);
      this.session.on("signal:chat", this.signalChatHandler);
      this.session.on("signal:filter", this.signalFilterHandler);
      this.session.on("signal:name", this.signalNameHandler);
      this.session.connect(this.apiKey, this.token);
      self = this;
      $(".filterOption").click(function() {
        var prop;
        $(".filterOption").removeClass("optionSelected");
        prop = $(this).data('value');
        self.applyClassFilter(prop, "#myPublisher");
        $(this).addClass("optionSelected");
        self.session.signal({
          type: "filter",
          data: {
            cid: self.session.connection.connectionId,
            filter: prop
          }
        }, self.errorSignal);
        return self.filterData[self.session.connection.connectionId] = prop;
      });
      $('#messageInput').keypress(this.inputKeypress);
      window.onresize = function() {
        return self.layout();
      };
    }

    User.prototype.sessionConnectedHandler = function(event) {
      console.log("session connected");
      this.subscribeStreams(event.streams);
      this.session.publish(this.publisher);
      this.layout();
      this.myConnectionId = this.session.connection.connectionId;
      this.name = "Guest-" + (this.myConnectionId.substring(this.myConnectionId.length - 8, this.myConnectionId.length));
      this.allUsers[this.myConnectionId] = this.name;
      $("#messageInput").removeAttr("disabled");
      return $('#messageInput').focus();
    };

    User.prototype.sessionDisconnectedHandler = function(event) {
      console.log(event.reason);
      if (event.reason === "forceDisconnected") {
        alert("Someone in the room found you offensive and removed you. Please evaluate your behavior");
      } else {
        alert("You have been disconnected! Please try again");
      }
      return window.location = "/";
    };

    User.prototype.streamCreatedHandler = function(event) {
      console.log("streamCreated");
      this.subscribeStreams(event.streams);
      return this.layout();
    };

    User.prototype.streamDestroyedHandler = function(event) {
      var stream, _i, _len, _ref;
      _ref = event.streams;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stream = _ref[_i];
        if (this.session.connection.connectionId === stream.connection.connectionId) {
          return;
        }
        this.removeStream(stream.connection.connectionId);
      }
      return this.layout();
    };

    User.prototype.connectionCreatedHandler = function(event) {
      var cid, guestName;
      console.log("new connection created");
      cid = "" + event.connections[0].id;
      guestName = "Guest-" + (cid.substring(cid.length - 8, cid.length));
      console.log("signaling over!");
      console.log(this.allUsers);
      this.allUsers[cid] = guestName;
      this.writeChatData({
        name: this.name,
        text: "/serv " + guestName + " has joined the room"
      });
      this.session.signal({
        type: "initialize",
        to: event.connection,
        data: {
          chat: this.chatData,
          filter: this.filterData,
          users: this.allUsers,
          random: [1, 2, 3]
        }
      }, this.errorSignal);
      return console.log("signal new connection room info");
    };

    User.prototype.connectionDestroyedHandler = function(event) {
      var cid;
      cid = "" + event.connections[0].id;
      this.writeChatData({
        name: this.name,
        text: "/serv " + this.allUsers[cid] + " has left the room"
      });
      return delete this.allUsers[cid];
    };

    User.prototype.signalInitializeHandler = function(event) {
      var e, k, v, _i, _len, _ref, _ref1, _ref2;
      console.log("initialize handler");
      console.log(event.data);
      if (this.initialized) {
        return;
      }
      _ref = event.data.users;
      for (k in _ref) {
        v = _ref[k];
        this.allUsers[k] = v;
      }
      _ref1 = event.data.filter;
      for (k in _ref1) {
        v = _ref1[k];
        this.filterData[k] = v;
      }
      _ref2 = event.data.chat;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        e = _ref2[_i];
        this.writeChatData(e);
      }
      return this.initialized = true;
    };

    User.prototype.signalChatHandler = function(event) {
      return this.writeChatData(event.data);
    };

    User.prototype.signalFilterHandler = function(event) {
      var val;
      val = event.data;
      console.log("filter received");
      return this.applyClassFilter(val.filter, ".stream" + val.cid);
    };

    User.prototype.signalNameHandler = function(event) {
      console.log("name signal received");
      console.log(event.data);
      return this.allUsers[event.data[0]] = event.data[1];
    };

    User.prototype.inputKeypress = function(e) {
      var k, msgData, parts, text, v, _ref, _ref1;
      msgData = {};
      if (e.keyCode === 13) {
        text = $('#messageInput').val().trim();
        if (text.length < 1) {
          return;
        }
        parts = text.split(' ');
        if (parts[0] === "/help") {
          this.printCommands();
          $('#messageInput').val('');
          return;
        }
        if (parts[0] === "/list") {
          this.displayChatMessage(this.notifyTemplate({
            message: "-----------"
          }));
          this.displayChatMessage(this.notifyTemplate({
            message: "Users currently in the room"
          }));
          _ref = this.allUsers;
          for (k in _ref) {
            v = _ref[k];
            this.displayChatMessage(this.notifyTemplate({
              message: "- " + v
            }));
          }
          this.displayChatMessage(this.notifyTemplate({
            message: "-----------"
          }));
          $('#messageInput').val('');
          return;
        }
        if (parts[0] === "/name" || parts[0] === "/nick") {
          _ref1 = this.allUsers;
          for (k in _ref1) {
            v = _ref1[k];
            if (v === parts[1] || parts[1].length <= 2) {
              alert("Sorry, but that name has already been taken or is too short.");
              return;
            }
          }
          msgData = {
            name: parts[1],
            text: "/serv " + this.name + " is now known as " + parts[1]
          };
          this.session.signal({
            type: "name",
            data: [this.myConnectionId, parts[1]]
          }, this.errorSignal);
          this.name = parts[1];
        } else {
          msgData = {
            name: this.name,
            text: text
          };
        }
        $('#messageInput').val('');
        return this.session.signal({
          type: "chat",
          data: msgData
        }, this.errorSignal);
      }
    };

    User.prototype.errorSignal = function(error) {
      if (error) {
        return console.log("signal error: " + error.reason);
      }
    };

    User.prototype.applyClassFilter = function(prop, selector) {
      if (prop) {
        $(selector).removeClass("Blur Sepia Grayscale Invert");
        $(selector).addClass(prop);
        return console.log("applyclassfilter..." + prop);
      }
    };

    User.prototype.removeStream = function(cid) {
      var element$;
      element$ = $(".stream" + cid);
      return element$.remove();
    };

    User.prototype.subscribeStreams = function(streams) {
      var divId, divId$, self, stream, streamConnectionId, _i, _len;
      for (_i = 0, _len = streams.length; _i < _len; _i++) {
        stream = streams[_i];
        streamConnectionId = stream.connection.connectionId;
        if (this.session.connection.connectionId === streamConnectionId) {
          return;
        }
        divId = "stream" + streamConnectionId;
        $("#streams_container").append(this.userStreamTemplate({
          id: divId
        }));
        this.session.subscribe(stream, divId, {
          width: "100%",
          height: "100%"
        });
        this.applyClassFilter(this.filterData[streamConnectionId], ".stream" + streamConnectionId);
        divId$ = $("." + divId);
        divId$.mouseenter(function() {
          return $(this).find('.flagUser').show();
        });
        divId$.mouseleave(function() {
          return $(this).find('.flagUser').hide();
        });
        self = this;
        divId$.find('.flagUser').click(function() {
          var streamConnection;
          streamConnection = $(this).data('streamconnection');
          if (confirm("Is this user being inappropriate? If so, we are sorry that you had to go through that. Click confirm to remove user")) {
            self.applyClassFilter("Blur", "." + streamConnection);
            return self.session.forceDisconnect(streamConnection.split("stream")[1]);
          }
        });
      }
    };

    User.prototype.writeChatData = function(val) {
      var e, message, text, urlRegex, _i, _len;
      this.chatData.push({
        name: val.name,
        text: unescape(val.text)
      });
      text = val.text.split(' ');
      if (text[0] === "/serv") {
        this.displayChatMessage(this.notifyTemplate({
          message: val.text.split("/serv")[1]
        }));
        return;
      }
      message = "";
      urlRegex = /(https?:\/\/)?([\da-z\.-]+)\.([a-z]{2,6})(\/.*)?$/g;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        e = text[_i];
        if (e.length < 2000 && e.match(urlRegex) && e.split("..").length < 2 && e[e.length - 1] !== ".") {
          message += e.replace(urlRegex, "<a href='http://$2.$3$4' target='_blank'>$1$2.$3$4<a>") + " ";
        } else {
          message += Handlebars.Utils.escapeExpression(e) + " ";
        }
      }
      val.text = message;
      return this.displayChatMessage(this.messageTemplate(val));
    };

    User.prototype.displayChatMessage = function(message) {
      $("#displayChat").append(message);
      return $('#displayChat')[0].scrollTop = $('#displayChat')[0].scrollHeight;
    };

    User.prototype.printCommands = function() {
      this.displayChatMessage(this.notifyTemplate({
        message: "-----------"
      }));
      this.displayChatMessage(this.notifyTemplate({
        message: "Welcome to OpenTokRTC."
      }));
      this.displayChatMessage(this.notifyTemplate({
        message: "Type /nick your_name to change your name"
      }));
      this.displayChatMessage(this.notifyTemplate({
        message: "Type /list to see list of users in the room"
      }));
      this.displayChatMessage(this.notifyTemplate({
        message: "Type /help to see a list of commands"
      }));
      return this.displayChatMessage(this.notifyTemplate({
        message: "-----------"
      }));
    };

    return User;

  })();

  window.User = User;

}).call(this);
