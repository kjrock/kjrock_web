Filter
======
posted: 2013-03-03
description: >
  Apply a simple low pass filter to a sound. Lets you tweak frequency
  and Q values.

<input type="button" onclick="sample.toggle();" value="Play/Pause">

<input type="checkbox" id="c1" checked="false" onchange="sample.toggleFilter(this);">
<label for="c1"><span></span>Enable filter</label>

<input type="range" min="0" max="1" step="0.01" value="1" oninput="sample.changeFrequency(this);"> Frequency

<input type="range" min="0" max="1" step="0.01" value="0" oninput="sample.changeQuality(this);"> Quality

<script src="/static/js/shared.js"></script>
<script src="filter-sample.js"></script>
<script>
var sample = new FilterSample();
</script>
