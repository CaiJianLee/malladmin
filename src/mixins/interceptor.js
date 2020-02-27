//vue 的混入 需要引入使用
const interceptor = {
  data () {
    return {
      interceptorState: true,//节流控制状态
    }
  },
  methods: {
    //按钮截流
    interceptorFn(fn) {
      if (this.interceptorState) {
        this.interceptorState = false;
        fn();
        setTimeout(() => {
          this.interceptorState = true;
        }, 600);
      }
    }
  }
};

export {
  interceptor,
}
