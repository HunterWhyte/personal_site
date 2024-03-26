document.addEventListener('DOMContentLoaded', () => {
  console.log('Hello, World!');
});

document.getElementById('projectsButton').addEventListener('click', function() {
  document.getElementById('projectsContainer').classList.toggle('expanded');
  console.log('Hello, World!');
});
