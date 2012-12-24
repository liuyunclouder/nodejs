module.exports.init = function () {
  var mongoose = require('mongoose');
  mongoose.connect('localhost', 'test');

  var schema = mongoose.Schema({ name: 'string' });
  var Cat = mongoose.model('Cat', schema);

  var kitty = new Cat({ name: 'water' }),
        anotherKitty = new Cat({name: 'tree'});
  kitty.save(onsave);
  anotherKitty.save(onsave);

  function onsave(err) {
    if (err) // ...
    console.log('yeah');
  }
};