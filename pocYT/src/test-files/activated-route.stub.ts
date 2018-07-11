export class ActivatedRouteStub {

  public paramMapValueToReturn = 'placeholder_stub';
  
  public get snapshot() {
    var that = this;
    return {
      paramMap: {
        get: function(str: string) {
          if (str == 'id') {
            return that.paramMapValueToReturn;
          }
        }
      }
    }
  }
  
}