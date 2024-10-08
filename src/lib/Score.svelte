<script>
    export let score = 0;
    export let analysis = '';
  </script>
  
  <div class="score">
    <h2>Beauty Score</h2>
    <p>{score.toFixed(2)} / 10</p>
  </div>

  <div class="analysis">
    <h2>AI Analysis</h2>
    <p>{analysis}</p>
  </div>
  
  <style>
    .score {
      margin: 20px 0;
    }
    .analysis {
      margin: 20px 0;
      text-align: left;
    }
    h2 {
      margin-bottom: 10px;
    }
    p {
      font-size: 24px;
      font-weight: bold;
    }
  </style>