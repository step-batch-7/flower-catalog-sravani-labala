/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const main = function() {
  const jug = document.getElementById('wateringJug');
  jug.style.visibility = 'hidden';
  const timeoutSeconds = 1000;
  setTimeout(() => {
    jug.style.visibility = 'visible';
  }, timeoutSeconds);
};
