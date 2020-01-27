const blinkBucket = function() {
  document.getElementById('bucket').style.visibility = 'hidden';
  setTimeout(
    () => (document.getElementById('bucket').style.visibility = 'visible'),
    1000
  );
};
