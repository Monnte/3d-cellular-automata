# 3D cellular automata

**Online demo:** [https://3d-cellular-automata.netlify.app/](https://3d-cellular-automata.netlify.app/)

Hello! This is a application to try out 3D Cellular Automata. Feel free to try it out and play with it. You can set seeds, change rules and more, just check the edit mode checkbox. To capture perfect render, move the camera to the position you want and then click on download render button.

## App preview

![App preview](/app.png)

## Seeds file import

The expected fomrat is a `.txt` file with the following format:

```
x y z
x y z
x y z
```

Where `x`, `y` and `z` are integers, in range `0` to `49` as grid size is `50x50x50`.

## Features list

- Capture canvas
- Record canvas
- Colors
- Camera movment

<p style=>Inspired by <a href="https://softologyblog.wordpress.com/2019/12/28/3d-cellular-automata-3/">Softology Blog 3D Cellular Automata</a></p>

## Example renders

<!-- image from renders -->
**Crystal gif**
![render1](/renders/crystal.gif)

**Crystal top | Crystal white**
<!-- ![render2](/renders/crystal_rbg_top.png) -->
<div style="flex justify-center items-center flex-wrap">
<img src="/renders/crystal_rbg_top.png" width="49%">
<img src="/renders/crystal_white.png" width="49%">
</div>
