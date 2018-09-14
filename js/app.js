; (function (window, Vue) {
	// 从本地存储中获取数据，若本地无数据则为空数组
	const todos = JSON.parse(window.localStorage.getItem('todos')||'[]')
	var todoapp = new Vue({
		el: '#todoapp',
		data: {
			todos,
			// 添加任务框编辑状态初始值为null
			todoediting: null,
			// 添加初始过滤任务数据为空
			filtertodos: [],
			// 添加初始hash值
			hash: ''
		},
		methods: {
			// 添加任务方法
			// 添加e(event)参数是为了调用target 事件属性返回事件的目标节点
			addtodo(e) {
				// 普通写法
				// const todos=this.todos
				// 结构赋值
				const { todos } = this
				const input = e.target
				const value = input.value
				// 非空校验
				// 若输入字符为空则跳出添加方法
				if (!value.trim()) {
					return
				}
				// 判断todos是否有数据存在,从而确定添加新任务的id值
				const lasttodo = todos[todos.length - 1]
				const id = lasttodo ? lasttodo.id + 1 : 1
				// 将数据添加到数组中
				todos.push({
					id,
					// 任务名称为e.target.value
					title: value,
					// 添加的新任务默认完成状态为false
					done: false
				})
				// window.localStorage.setItem('todos', JSON.stringify(todos))
				// 添加任务完成后清空文本框
				input.value = ''
			},
			// 移除单个任务方法
			// 方法中传入当前点击删除的任务索引值(index)
			removeTodo(index) {
				this.todos.splice(index, 1)
			},
			// 双击确定需要添加编辑状态的任务框
			getediting(todo) {
				this.todoediting = todo
			},
			// 保存修改后的任务数据
			savetodo(todo, index, e) {
				const value = e.target.value
				// 如果删除任务名则将任务移除
				if (value.trim().length === 0) {
					this.todos.splice(index, 1)
				} else {
					// 修改任务名称
					todo.title = value
					// 取消编辑状态框
					this.todoediting = null
				}
			},
			// 取消编辑
			canceltodo() {
				// 直接取消编辑状态框
				this.todoediting = null
			},
			// 过滤所有未完成的任务数量(改用计算属性(remaining)替代该方法.好处:计算属性重复使用不会重复计算)
			// getremaining() {
			// 	return this.todos.filter(todo => !todo.done).length
			// },
			// 批量删除已完成的任务
			cleardone() {
				const todos = this.todos
				for (var i = 0; i < todos.length; i++) {
					if (todos[i].done === true) {
						todos.splice(i, 1)
						i--
					}
				}
			}
			// toggleall(e) {
			// 	// 原始赋值写法
			// 	// const checked = e.target.checked
			// 	// 解构赋值写法
			// 	const { checked } = e.target
			// 	//箭头函数简写
			// 	this.todos.forEach(item => {
			// 		item.done = checked
			// 	});
			// 	// 对比正常函数写法
			// 	// this.todos.forEach(function(item){
			// 	// 	item.done=checked
			// 	// }) 
			// }
		},
		// 计算属性选项对象
		// 计算属性的本质是方法，但是只能当做属性来使用,不能调用！
		// 所谓的计算属性就是带有行为的属性，只能当作属性来使用
		// 计算属性和方法来对比唯一的区别就是：
		// 		计算属性会把计算的结果进行缓存
		// 		如果使用多次该计算属性，实际上只调用了一次
		// 		而换成方法的话，就每使用一次就调用一次
			computed: {
				// 计算所有未完成的任务数量
			remaining() {
				return this.todos.filter(todo => !todo.done).length
			},
			// 计算至少有一个任务完成,返回一个布尔值
			completing(){
				return this.todos.some(item=> item.done===true)
			},
		// 计算属性的的完整写法是：
		// 属性名: {
		//   get: function () {}, // 当访问该属性的时候，会自动调用 get 方法
		//   set: function () {} // 当为属性赋值的时候，会调用 set 方法
		// }
		// 属性名: function () {} 是
		// 		属性名: {
		// 		  get: function () {}
		// 		}
		// 的简写方式
		// 计算属性非一般属性，本身不存储任何值，它的值来自于它自己的 get 方法
		// 实现全选与单选联动的计算属性
			togglestat: {
				// 获取每个任务都处于完成状态
				get() {
					// 判断是否每个任务都处于完成状态,返回值toggle为布尔值
					const toggle = this.todos.every(function (item) {
						return item.done === true
					})
					// 再返回toggle
					return toggle
				},
				// 修改每个任务的状态与全选框的状态一致
				set(val) {// 为什么set函数中的形参无论是什么,获取到的都是全选的value值?
					console.dir(val)
					this.todos.forEach(item => {
						item.done = val
					})
				}
			}
		},
		// watch 对象的 key 必须是要被监视的实例成员（data中的数据成员、计算属性中成员）
		// watch 对象默认状态下，只能监视对象或者数组成员的添加或者删除，如果需要无级后代监视，则需要配置为深度监视
		watch: {
			// 深度监视如下所示
			todos: {
				// 当todos一旦发生变动
				handler:function() {
					// 1.将改变后的todos数据同步到本地存储中
					window.localStorage.setItem('todos', JSON.stringify(this.todos))
					// 2.本地存储更新之后再次调用该方法,从而能够使filtertodos数据与todos数据同步
					window.onhashchange()
				},
				deep: true
			},
			// 默认监视状态示例
			// todos () { 
			// 	console.log('todos 发生改变了')
			// }
		}
	})
	// 将todoapp暴露给全局变量
	window.app = todoapp
	window.onhashchange = function () {
		// 获取当前页面的hash值
		// 普通写法:
		// const hash = window.location.hash
		// 解构赋值
		const { hash } = window.location
		// 将获取到的hash值存入todoapp的hash中
		app.hash = hash
		// 判断hash值,过滤任务条件
		switch (hash) {
			case '#/active':
				app.filtertodos = app.todos.filter(function (todo) {
					return todo.done === false
				})
				break
			case '#/completed':
				app.filtertodos = app.todos.filter(function (todo) {
					return todo.done === true
				})
				break
			// 	switch中的default,一般用在所有条件最后,表示非以上任何一种情况下而发生的情况
			default:
				app.hash='#/'
				app.filtertodos = app.todos
				break
		}
	}
	// 数据初始化加载
	window.onhashchange()
})(window, Vue);
