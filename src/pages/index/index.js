import "../../libs/common/index";
import "./index.css";
import Axios from "axios";
$(function() {
  // 添加请求拦截器
  Axios.interceptors.request.use(
    function(config) {
      // 在发送请求之前做些什么
      console.log("发送请求");
      return config;
    },
    function(error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  Axios.interceptors.response.use(
    function(response) {
      // 对响应数据做点什么
      console.log("接收请求");
      return response;
    },
    function(error) {
      // 对响应错误做点什么
      return Promise.reject(error);
    }
  );
  Axios.get("/api/gists")
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
  // Dropdowns
  // var $dropdowns = getAll(".dropdown:not(.is-hoverable)");
  // if ($dropdowns.length > 0) {
  //   $dropdowns.forEach(function($el) {
  //     $el.addEventListener("click", function(event) {
  //       event.stopPropagation();
  //       $el.classList.toggle("is-active");
  //     });
  //   });
  //   document.addEventListener("click", function(event) {
  //     closeDropdowns();
  //   });
  // }
  // function closeDropdowns() {
  //   $dropdowns.forEach(function($el) {
  //     $el.classList.remove("is-active");
  //   });
  // }
  // // navbar
  // // Get all "navbar-burger" elements
  // var $navbarBurgers = Array.prototype.slice.call(
  //   document.querySelectorAll(".navbar-burger"),
  //   0
  // );
  // // Check if there are any navbar burgers
  // if ($navbarBurgers.length > 0) {
  //   // Add a click event on each of them
  //   $navbarBurgers.forEach(function($el) {
  //     $el.addEventListener("click", function() {
  //       // Get the target from the "data-target" attribute
  //       var target = $el.dataset.target;
  //       var $target = document.getElementById(target);
  //       // Toggle the class on both the "navbar-burger" and the "navbar-menu"
  //       $el.classList.toggle("is-active");
  //       $target.classList.toggle("is-active");
  //     });
  //   });
  // }
  // //get All()
  // function getAll(selector) {
  //   return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  // }
});
