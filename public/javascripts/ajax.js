function main() {
  $.ajax('\getsong').done(function(data){
    console.log(data);
  });



}

main();
