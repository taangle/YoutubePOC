export class ActivatedRouteStub {

  public paramMapValueToReturn = 'placeholder_stub';
  
  public get snapshot() {
    var that = this;
    return {
      paramMap: {
        get: function(str: string) {
          console.log("~~called get on paramMap on snapshot");
          if (str == 'id') {
            console.log('~~called with \'id\'');
            console.log('~~returning: ' + that.paramMapValueToReturn);
            return that.paramMapValueToReturn;
          }
        }
      }
    }
  }
  
}